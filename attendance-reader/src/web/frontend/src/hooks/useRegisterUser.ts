import { useState } from 'react';
import { postUser } from '../api/user';

export const useRegisterUser = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] 			  = useState<string | null>(null);

	const submitUser = async (id: string, name: string, grade: string): Promise<boolean> => {
		setIsSubmitting(true);
		setError(null);
		try {
			// id, name, gradeを使用してユーザー情報を登録
			const success = await postUser({ id, name, grade });
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

	return { isSubmitting, error, submitUser };
};
