import { useEffect, useState, useRef } from 'react';
import { readCard } 				   from '../api/cardReader';

// カードリーダーの読み取りを行うカスタムフック
export const useCardReader = () => {
	const [nfcId, setNfcId]         = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const controllerRef             = useRef<AbortController | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		controllerRef.current = controller;

		// カード読み取りを非同期で実行
		const fetchCard = async () => {
			const result = await readCard(controller.signal);
			if (result) {
				setNfcId(result);
			}
			setIsLoading(false);
		};
		// 読み取りを開始
		fetchCard();

		return () => {
			// ページ離脱時の中断
			controller.abort();
		};
	}, []);

	// 読み取りをキャンセルする関数
	const cancel = () => {
		controllerRef.current?.abort();
		setIsLoading(false);
	};

	return { nfcId, isLoading, cancel };
};
