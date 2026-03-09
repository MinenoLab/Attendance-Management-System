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

    const connectWebSocket = () => {
        const basePath = process.env.REACT_APP_WEBSOCKET_API_BASE_PATH;
        // 在室管理と同じ接続先か、メッセージ専用のパスかをバックエンドに合わせて調整してください
        const stage    = 'v1'; 

        if (!basePath) {
            setError(new Error("WebSocketの接続URLが設定されていません．"));
            return;
        }

        // 必要に応じてエンドポイントを変更 (例: `${basePath}/${stage}/messages/`)
        const fullUrl = `${basePath}/${stage}/`;
        const socket  = new WebSocket(fullUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            setError(null);
            reconnectAttemptsRef.current = 0;
            pingIntervalRef.current = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ action: 'ping' })); // バックエンドの仕様に合わせて'type'や'action'を調整
                }
            }, 9 * 60 * 1000);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'pong' || data.action === 'pong') return;

            // 新しいメッセージを受信した場合（バックエンドのJSON構造に合わせて調整）
            // 例: { type: 'new_message', data: { id, sender, content, createdAt, priority } }
            if (data.type === 'new_message' && data.message) {
                const newMsg: LabMessage = data.message;
                // 新しいメッセージを先頭に追加する
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
                    setError(new Error(`サーバーとの接続が切れました。コード: ${event.code}`));
                }
            }
        };
    };

    useEffect(() => {
        connectWebSocket();
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