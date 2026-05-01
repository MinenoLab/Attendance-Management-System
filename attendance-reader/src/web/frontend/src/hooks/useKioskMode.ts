import { useEffect, useRef } from 'react';

type UseKioskModeOptions = {
	idleTimeoutMs?: number;
	onIdle?: () => void;
};

const DEFAULT_IDLE_TIMEOUT_MS = 180_000;

type WakeLockSentinelLike = {
	release: () => Promise<void>;
	addEventListener: (type: 'release', listener: () => void) => void;
};

type WakeLockApi = {
	request: (type: 'screen') => Promise<WakeLockSentinelLike>;
};

const getWakeLockApi = (): WakeLockApi | undefined => {
	return (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
};

export function useKioskMode(options?: UseKioskModeOptions): void {
	const idleTimeoutMs = options?.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS;
	const onIdleRef = useRef<() => void>(() => {
		window.location.reload();
	});

	if (options?.onIdle) {
		onIdleRef.current = options.onIdle;
	}

	useEffect(() => {
		let idleTimerId: number | null = null;
		let wakeLockSentinel: WakeLockSentinelLike | null = null;

		const resetIdleTimer = () => {
			if (idleTimerId !== null) {
				window.clearTimeout(idleTimerId);
			}
			idleTimerId = window.setTimeout(() => {
				onIdleRef.current();
			}, idleTimeoutMs);
		};

		const handleContextMenu = (event: MouseEvent) => {
			event.preventDefault();
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				(event.ctrlKey || event.metaKey) &&
				(event.key === '+' || event.key === '-' || event.key === '=' || event.key === '0')
			) {
				event.preventDefault();
			}
			resetIdleTimer();
		};

		const handleActivity = () => {
			resetIdleTimer();
		};

		const requestWakeLock = async () => {
			const wakeLockApi = getWakeLockApi();
			if (!wakeLockApi) {
				console.warn('Screen Wake Lock API is not supported in this browser.');
				return;
			}
			try {
				const sentinel = await wakeLockApi.request('screen');
				wakeLockSentinel = sentinel;
				sentinel.addEventListener('release', () => {
					if (wakeLockSentinel === sentinel) {
						wakeLockSentinel = null;
					}
				});
			} catch (error) {
				console.warn('Failed to acquire Screen Wake Lock:', error);
			}
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible' && wakeLockSentinel === null) {
				void requestWakeLock();
			}
		};

		document.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('touchstart', handleActivity, { passive: true });
		document.addEventListener('mousedown', handleActivity);
		document.addEventListener('visibilitychange', handleVisibilityChange);

		resetIdleTimer();
		void requestWakeLock();

		return () => {
			document.removeEventListener('contextmenu', handleContextMenu);
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('touchstart', handleActivity);
			document.removeEventListener('mousedown', handleActivity);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			if (idleTimerId !== null) {
				window.clearTimeout(idleTimerId);
			}
			if (wakeLockSentinel !== null) {
				const sentinel = wakeLockSentinel;
				wakeLockSentinel = null;
				void sentinel.release().catch(() => {
					/* ignore */
				});
			}
		};
	}, [idleTimeoutMs]);
}
