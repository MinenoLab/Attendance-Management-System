import { useState, useEffect, useRef } from 'react';
import { LabMessage } from '../components/MessageBoard/MessageBoard';

interface UseMessageSocketReturn {
    messages: LabMessage[];
    error: Error | null;
}

export const useMessageSocket = (initialMessages: LabMessage[] = []): UseMessageSocketReturn => {
    const [messages, setMessages] = useState<LabMessage[]>(initialMessages);
    const [error, setError]       = useState<Error | null>(null);
    const socketRef               = useRef<WebSocket | null>(null);
    const pingIntervalRef         = useRef<NodeJS.Timeout | null>(null);
    const reconnectTimeoutRef     = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef    = useRef<number>(0);
    const maxReconnectAttempts    = 5;
    const baseReconnectDelay      = 1000;

    // 1. 初期データ（過去のメッセージ）を取得する関数を追加
    const fetchInitialMessages = async () => {
        const basePath = process.env.REACT_APP_API_BASE_PATH;
        const apiKey = process.env.REACT_APP_API_KEY;

        if (!basePath || !apiKey) {
            console.error("APIのURLまたはキーが設定されていません．");
            return;
        }

        try {
            const response = await fetch(`${basePath}/v1/message`, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`APIからのデータ取得に失敗しました: ${response.status}`);
            }

            const data: LabMessage[] = await response.json();
            setMessages(data);
        } catch (err) {
            console.error("初期メッセージの取得エラー:", err);
            if (err instanceof Error) setError(err);
        }
    };

    const connectWebSocket = () => {
        const basePath = process.env.REACT_APP_WEBSOCKET_API_BASE_PATH;
        const stage    = 'v1'; 

        if (!basePath) {
            setError(new Error("WebSocketの接続URLが設定されていません．"));
            return;
        }

        const fullUrl = `${basePath}/${stage}/`;
        const socket  = new WebSocket(fullUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            setError(null);
            reconnectAttemptsRef.current = 0;
            pingIntervalRef.current = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ action: 'ping' })); 
                }
            }, 9 * 60 * 1000);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'pong' || data.action === 'pong') return;

            // 新しいメッセージを受信した場合，既存のリストの先頭に追加
            if (data.type === 'new_message' && data.message) {
                const newMsg: LabMessage = data.message;
                setMessages(prevMessages => [newMsg, ...prevMessages]);
            }
        };

        socket.onerror = () => {
            setError(new Error("メッセージサーバーとの接続で問題が発生しました．"));
        };

        socket.onclose = (event) => {
            if (pingIntervalRef.current) {
                clearInterval(pingIntervalRef.current);
                pingIntervalRef.current = null;
            }

            if (event.code !== 1000) {
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const reconnectDelay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current++;
                        connectWebSocket();
                    }, reconnectDelay);
                } else {
                    setError(new Error(`サーバーとの接続が切れました．コード: ${event.code}`));
                }
            }
        };
    };

    useEffect(() => {
        // 2. マウント時にまず過去のデータを取得し，その後にWebSocketの待ち受けを開始する
        fetchInitialMessages().then(() => {
            connectWebSocket();
        });

        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            if (socketRef.current) {
                socketRef.current.close(1000, "Component unmounted");
                socketRef.current = null;
            }
        };
    }, []);

    return { messages, error };
};