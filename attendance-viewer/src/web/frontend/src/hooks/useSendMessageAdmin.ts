import { useState, useCallback } from 'react';
import { LabMessage } from '../components/MessageBoard/MessageBoard';

interface UseSendMessageAdminReturn {
    sendMessage: (sender: string, priority: string, content: string) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
}

export const useSendMessageAdmin = (): UseSendMessageAdminReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError]         = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const sendMessage = useCallback(async (sender: string, priority: string, content: string) => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            const basePath = process.env.REACT_APP_API_BASE_PATH;
            // バックエンド側のエンドポイントに合わせて変更してください（例: /v1/messages）
            const url      = `${basePath}/v1/messages`;
            const apiKey   = process.env.REACT_APP_API_KEY;
            
            if (!basePath || !apiKey) {
                throw new Error("APIのパスまたはキーが.envファイルに設定されていません．");
            }
            
            const headers = new Headers();
            headers.append('x-api-key', apiKey);
            headers.append('Content-Type', 'application/json');
            
            // 既存の仕組みに則り、日本語を安全にBase64エンコードする
            const encodeToBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
            
            const payload = {
                sender  : encodeToBase64(sender),
                priority: priority, // 'info' 等は英字なのでエンコード不要
                content : encodeToBase64(content),
            };

            const response = await fetch(url, {
                method : 'POST',
                headers: headers,
                body   : JSON.stringify(payload),
            });
            
            if (!response.ok) {
                throw new Error(`APIの応答が正常ではありません: ${response.status}`);
            }
            setIsSuccess(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err);
            } else {
                setError(new Error('An unknown error occurred'));
            }
            throw err; // 呼び出し元（AdminPage）でもエラーを検知できるようにスロー
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { sendMessage, isLoading, error, isSuccess };
};