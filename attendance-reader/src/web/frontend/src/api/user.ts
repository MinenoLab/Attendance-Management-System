const API_BASE = process.env.REACT_APP_API_BASE_URL;
const USER_ENDPOINT = `${API_BASE}/user`;

type UserData = {
	id	 : string;
	name : string;
	grade: string;
};

export const postUser = async (data: UserData): Promise<boolean> => {
	// API_BASE_URLが設定されていない場合はエラーを出力
	if (!API_BASE) {
		console.error('API_BASE_URLが設定されていません');
		return false;
	}

	try {
		// USER_ENDPOINTにPOSTリクエストを送信
		const res = await fetch(USER_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		// レスポンスのステータスコードをチェック
		if (!res.ok) {
			console.warn('ユーザー登録APIが失敗しました:', res.status);
			return false;
		}
		// レスポンスのContent-Typeをチェック
		const contentType = res.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			console.warn('予期しないレスポンス形式:', await res.text());
			return false;
		}
		// 応答内容は使用しないが、バリデーションとして解析
		await res.json();
		return true;

	} catch (err: any) {
		console.error('ユーザー登録エラー:', err);
		return false;
	}
};
