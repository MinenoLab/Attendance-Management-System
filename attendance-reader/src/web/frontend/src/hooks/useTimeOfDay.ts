// 時間帯を取得するフック
// 5時から10時までを朝、10時から17時までを昼、17時から19時までを夕方、それ以外を夜とする
export const useTimeOfDay = (): string => {
	const hour = new Date().getHours();
	// 時間帯を判定
	if (hour >= 5 && hour < 10)  return 'morning';
	if (hour >= 10 && hour < 17) return 'day';
	if (hour >= 17 && hour < 19) return 'evening';
	return 'night';
};
