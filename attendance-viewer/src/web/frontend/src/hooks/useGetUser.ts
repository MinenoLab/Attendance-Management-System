import { useState, useEffect }                   from 'react';
import type { UserIdentifier, UseGetUserReturn } from '../types/attendance';

export const useGetUser   = (): UseGetUserReturn => {
    const [users, setUsers]         = useState<UserIdentifier[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError]         = useState<Error | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const basePath = process.env.REACT_APP_API_BASE_PATH;
                const url      = `${basePath}/v1/user`;
                const apiKey   = process.env.REACT_APP_API_KEY;
                // 環境変数が設定されていない場合はエラーをセット
                if (!apiKey) {
                    throw new Error("APIキーが.envファイルに設定されていません．");
                }
                const headers = new Headers();
                headers.append('x-api-key', apiKey);

                const response = await fetch(url, { headers: headers });
                // レスポンスが正常でない場合はエラーをスロー
                if (!response.ok) {
                    throw new Error(`APIの応答が正常ではありません: ${response.status}`);
                }
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                // エラーがErrorインスタンスであればそのままセット、そうでなければ一般的なエラーをセット
                if (err instanceof Error) {
                    setError(err);
                } else {
                    setError(new Error('An unknown error occurred'));
                }
            } finally {
                // ローディング状態を終了
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    return { users, isLoading, error };
};