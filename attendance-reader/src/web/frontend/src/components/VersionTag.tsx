import { useEffect, useState, type JSX } from 'react';

import styles from './VersionTag.module.css';

type VersionInfo = {
	hash: string;
	branch?: string;
	time: string;
};

const POLL_INTERVAL_MS = 60_000;

const pad = (n: number): string => String(n).padStart(2, '0');

const formatTime = (iso: string): string => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return '';
	}
	return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function VersionTag(): JSX.Element | null {
	const [version, setVersion] = useState<VersionInfo | null>(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const response = await fetch('/version.json', { cache: 'no-store' });
				if (!response.ok) {
					return;
				}
				const data: VersionInfo = await response.json();
				if (!cancelled) {
					setVersion(data);
				}
			} catch {
				// version.json が無いデプロイで graceful に何も表示しない
			}
		};

		void load();
		const id = window.setInterval(load, POLL_INTERVAL_MS);

		return () => {
			cancelled = true;
			window.clearInterval(id);
		};
	}, []);

	if (!version) {
		return null;
	}

	const formattedTime = formatTime(version.time);
	const label = formattedTime ? `${version.hash} · ${formattedTime}` : version.hash;

	return <div className={styles.tag}>{label}</div>;
}
