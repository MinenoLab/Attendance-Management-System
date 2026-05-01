import { useEffect, useState, type JSX } from 'react';

import styles from './OfflineOverlay.module.css';

export function OfflineOverlay(): JSX.Element | null {
	const [isOnline, setIsOnline] = useState<boolean>(() =>
		typeof navigator === 'undefined' ? true : navigator.onLine,
	);

	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	if (isOnline) {
		return null;
	}

	return (
		<div className={styles.overlay} role="alert" aria-live="assertive">
			サーバーに接続できません．しばらくお待ちください．
		</div>
	);
}
