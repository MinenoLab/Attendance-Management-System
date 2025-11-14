import { useState, useEffect }                     from 'react';
import type { SnapshotData, UseGetSnapshotReturn } from '../types/attendance';

export const useGetSnapshot = (startDate: string, endDate: string, userName?: string): UseGetSnapshotReturn => {
    const [snapshotData, setSnapshotData] = useState<SnapshotData | null>(null);
    const [isLoading, setIsLoading]       = useState<boolean>(true);
    const [error, setError]               = useState<Error | null>(null);

    useEffect(() => {
        // startDateとendDateが未指定の場合は早期リターン
        if (!startDate || !endDate) {
            setIsLoading(false);
            setSnapshotData(null);
            return;
        }

        const fetchSnapshot = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const basePath = process.env.REACT_APP_API_BASE_PATH;
                const apiKey   = process.env.REACT_APP_API_KEY;

                if (!basePath || !apiKey) {
                    throw new Error("APIキーが.envファイルに設定されていません．");
                }

                // URLとクエリパラメータを安全に組み立てる
                const url = new URL(`${basePath}/v1/snapshot`);
                url.searchParams.append('startDate', startDate);
                url.searchParams.append('endDate', endDate);

                // userNameが指定されている場合はクエリパラメータに追加
                if (userName) {
                    url.searchParams.append('userName', userName);
                }

                const headers = new Headers();
                headers.append('x-api-key', apiKey);

                const response = await fetch(url.toString(), { headers });

                if (!response.ok) {
                    throw new Error(`APIの応答が正常ではありません: ${response.status}`);
                }

                const data: SnapshotData = await response.json();
                setSnapshotData(data);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err);
                } else {
                    setError(new Error('An unknown error occurred'));
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchSnapshot();
        // startDateかendDateが変更されたらAPIを再実行する
    }, [startDate, endDate, userName]);

    return { snapshotData, isLoading, error };
};