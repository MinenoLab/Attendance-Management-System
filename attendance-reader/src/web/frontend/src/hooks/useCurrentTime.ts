import { useEffect, useState } from 'react';

// 英語の曜日を使用（短縮形）
const ENGLISH_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 現在の日時を "YYYY-MM-DD (Weekday) HH:MM:SS" 形式で返すカスタムフック
export const useCurrentTime = (): { date: string; time: string } => {
	const [current, setCurrent] = useState(() => formatDateTime(new Date()));

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrent(formatDateTime(new Date()));
		}, 1000);
		return () => clearInterval(intervalId);
	}, []);

	return current;
};

// 日付と時刻をフォーマットする関数
const formatDateTime = (date: Date): { date: string; time: string } => {
	// 曜日の配列を定義
	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	// 年、月、日、曜日を取得
	const year    = date.getFullYear();
	const month   = String(date.getMonth() + 1).padStart(2, '0');
	const day 	  = String(date.getDate()).padStart(2, '0');
	const weekday = weekdays[date.getDay()];
	// 時、分、秒を取得
	const hours   = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return {
		date: `${year}-${month}-${day} (${weekday})`,
		time: `${hours}:${minutes}:${seconds}`
	};
};
