import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCardReader } 			from '../../hooks/useCardReader';
import { useRegisterAttendance } 	from '../../hooks/useRegisterAttendance';
import CompletionOverlay       		from '../../components/CompletionOverlay/CompletionOverlay';
import greatPeople 					from '../../data/great_people.json';
import './AttendanceCardWaitPage.css';

type WikiPerson = { title: string; description: string; imageUrl?: string | null };

const getRandomPerson = async (): Promise<WikiPerson> => {
	const item = greatPeople[Math.floor(Math.random() * greatPeople.length)];
	const url  = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(item.wikipedia_ja)}`;
	try {
		const res  = await fetch(url);
		const data = await res.json();
		return { title: item.name, description: item.description, imageUrl: data.thumbnail?.source ?? null };
	} catch {
		return { title: item.name, description: item.description };
	}
};

const AttendanceCardWaitPage = () => {
	const [overlay, setOverlay] = useState<{ status: string; person?: WikiPerson | null } | null>(null);
	const location = useLocation();
	const navigate = useNavigate();
	const type 	   = location.state?.type;

	const { nfcId, isLoading, cancel } 		 = useCardReader();
	const { submitAttendance, isSubmitting } = useRegisterAttendance();
	const registeredRef = useRef(false);

	// ページがマウントされたときにカードリーダーの読み取りを開始
	useEffect(() => {
		if (!nfcId || isSubmitting || registeredRef.current) return;
		registeredRef.current = true;

		// const register = async () => {
		// 	const success = await submitAttendance(nfcId, type);
		// 	navigate('/', {
		// 		state: {
		// 			toast: success
		// 				? `Registration was successful!`
		// 				: `Registration was failed..`
		// 		}
		// 	});
		// };

		const register = async () => {
			const success = await submitAttendance(nfcId, type);
			// const success = true; // ダミー成功
			if (success) {
				if (type === 'clock_in' || type === 'clock_out') {
					const person = type === 'clock_in' ? await getRandomPerson() : null;
					setOverlay({ status: type, person });
				} else {
					navigate('/');
				}
			} else {
				navigate('/', { state: { toast: 'Registration was failed..' } });
			}
		};


		register();
	}, [nfcId]);

	// キャンセルボタンのクリック処理
	const handleCancel = () => {
		cancel();
		navigate('/');
	};

	return (
		<>
			{overlay && (
				<CompletionOverlay
					status={overlay.status}
					person={overlay.person}
					onClose={() => {
						setOverlay(null);
						navigate('/');
					}}
				/>
			)}

			<div id="attendance-wait-page">

				<div className="card-animation">💳</div>

				<h2>
					カードをかざしてください
					<br />
					<small>Please hold your card over the reader</small>
				</h2>

				{isLoading ? (
					<p>
						カードを読み取っています...
						<br />
						<small>Reading card...</small>
					</p>
				) : nfcId ? (
					<p>&nbsp;</p>
				) : (
					<p>&nbsp;</p>
				)}

				<button onClick={handleCancel} id="cancel-button">
					中断 / Cancel
				</button>
			</div>
		</>
	);
};

export default AttendanceCardWaitPage;
