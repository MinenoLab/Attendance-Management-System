const API_BASE = process.env.REACT_APP_API_BASE_URL;
const CARD_ENDPOINT = `${API_BASE}/card/read`;

type CardResponse = {
	nfc_id: string;
};

export const readCard = async (signal?: AbortSignal): Promise<string | null> => {
	// API_BASE_URLが設定されていない場合はエラーを出力
	if (!API_BASE) {
		console.error('API_BASE_URLが設定されていません');
		return null;
	}

	try {
		// CARD_ENDPOINTにGETリクエストを送信
		const res = await fetch(CARD_ENDPOINT, {
			method: 'GET',
			signal
		});
		// レスポンスのステータスコードをチェック
		if (!res.ok) {
			console.warn('カードAPIが失敗しました:', res.status);
			return null;
		}
		// レスポンスのContent-Typeをチェック
		const contentType = res.headers.get('content-type');
		if (!contentType?.includes('application/json')) {
			console.warn('予期しないレスポンス形式:', await res.text());
			return null;
		}
		// 応答内容をJSONとして解析
		const data: CardResponse = await res.json();
		return data?.nfc_id ?? null;

	} catch (err: any) {
		// エラーがAbortErrorでない場合は警告を出力
		if (err.name !== 'AbortError') {
			console.warn('カード読み取り中断または失敗:', err);
		}
		return null;
	}
};
