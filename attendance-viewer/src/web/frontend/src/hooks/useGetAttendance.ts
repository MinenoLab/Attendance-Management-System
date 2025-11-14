import { useState, useEffect }               from 'react';
import type { User, UseGetAttendanceReturn } from '../types/attendance';

export const useGetAttendance   = (): UseGetAttendanceReturn => {
    const [users, setUsers]         = useState<User[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError]         = useState<Error | null>(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const basePath = process.env.REACT_APP_API_BASE_PATH;
                const url      = `${basePath}/v1/attendance`;
                const apiKey   = process.env.REACT_APP_API_KEY;
                // 環境変数が設定されていない場合はエラーをセット
                if (!basePath || !apiKey) {
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
                // エラーがErrorインスタンスであればそのままセット，そうでなければ一般的なエラーをセット
                if (err instanceof Error) {
                    setError(err);
                } else {
                    setError(new Error('An unknown error occurred'));
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    return { users, isLoading, error };
};