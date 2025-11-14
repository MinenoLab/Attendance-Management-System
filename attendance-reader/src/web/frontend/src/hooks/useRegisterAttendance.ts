import { useState }		  from 'react';
import { postAttendance } from '../api/attendance';

export const useRegisterAttendance = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] 			  = useState<string | null>(null);

	const submitAttendance = async (id: string, status: string): Promise<boolean> => {
		setIsSubmitting(true);
		setError(null);
		try {
			// idとstatusを使用して出席情報を登録
			const success = await postAttendance({ id, status });
			if (!success) throw new Error('登録に失敗しました');
			return true;
		} catch (err) {
			// エラーが発生した場合はエラーメッセージを設定
			setError((err as Error).message);
			return false;
		} finally {
			// 処理が完了したらisSubmittingをfalseに戻す
			setIsSubmitting(false);
		}
	};

	return { isSubmitting, error, submitAttendance };
};
