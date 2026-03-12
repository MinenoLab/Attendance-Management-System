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

            // AWS側でプロキシ統合をONにしたので、直接綺麗な配列として受け取れる
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
            console.error("WebSocketの接続URLが設定されていません．");
            return;
        }

        const fullUrl = `${basePath}/${stage}`;
        //console.log("🚀 WebSocket 接続開始:", fullUrl);

        const socket  = new WebSocket(fullUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            //console.log("✅ WebSocket 接続成功！"); // これが出れば開通です！
            setError(null);
            reconnectAttemptsRef.current = 0;
            pingIntervalRef.current = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ action: 'ping' })); 
                }
            }, 9 * 60 * 1000);
        };

        socket.onmessage = (event) => {
            console.log("📩 WebSocket メッセージ受信:", event.data); // リアルタイム受信の証拠
            const data = JSON.parse(event.data);

            if (data.type === 'pong' || data.action === 'pong') return;

            if (data.type === 'new_message' && data.message) {
                const newMsg: LabMessage = data.message;
                setMessages(prevMessages => [newMsg, ...prevMessages]);
            } else if (data.type === 'delete_message' && data.messageId) {
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== data.messageId));
            }
        };

        socket.onerror = (error) => {
            console.error("❌ WebSocket エラー発生:", error);
        };

        socket.onclose = (event) => {
            console.log(`⚠️ WebSocket 切断 (コード: ${event.code})`);
            // 切断時の再接続ロジック（そのまま）
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