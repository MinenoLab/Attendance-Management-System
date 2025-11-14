import { useState, useCallback }                           from 'react';
import type { UserStatus, UseUpdateAttendanceAdminReturn } from '../types/attendance';

export const useUpdateAttendanceAdmin = (): UseUpdateAttendanceAdminReturn => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError]         = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    const updateAttendance = useCallback(async (name: string, status: UserStatus) => {
        // 処理開始時に各ステートをリセット
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            const basePath = process.env.REACT_APP_API_BASE_PATH;
            const url      = `${basePath}/v1/admin`;
            const apiKey   = process.env.REACT_APP_API_KEY;
            // 環境変数が設定されていない場合はエラーをセット
            if (!basePath || !apiKey) {
                throw new Error("APIのパスまたはキーが.envファイルに設定されていません．");
            }
            const headers = new Headers();
            headers.append('x-api-key', apiKey);
            headers.append('Content-Type', 'application/json');
            // 日本語などのマルチバイト文字を安全にBase64エンコードする
            const encodeToBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
            const payload = {
                name  : encodeToBase64(name),
                status: encodeToBase64(status),
            };

            const response = await fetch(url, {
                method : 'POST',
                headers: headers,
                body   : JSON.stringify(payload),
            });
            // レスポンスが正常でない場合はエラーをスロー
            if (!response.ok) {
                throw new Error(`APIの応答が正常ではありません: ${response.status}`);
            }
            setIsSuccess(true);
        } catch (err) {
            // エラーがErrorインスタンスであればそのままセット．そうでなければ一般的なエラーをセット
            if (err instanceof Error) {
                setError(err);
            } else {
                setError(new Error('An unknown error occurred'));
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { updateAttendance, isLoading, error, isSuccess };
};
