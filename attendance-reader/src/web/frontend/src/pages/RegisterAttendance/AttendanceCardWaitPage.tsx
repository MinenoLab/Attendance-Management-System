import { useEffect } 				from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCardReader } 			from '../../hooks/useCardReader';
import { useRegisterAttendance } 	from '../../hooks/useRegisterAttendance';
import './AttendanceCardWaitPage.css';

const AttendanceCardWaitPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const type 	   = location.state?.type;

	const { nfcId, isLoading, cancel } 		 = useCardReader();
	const { submitAttendance, isSubmitting } = useRegisterAttendance();

	// ページがマウントされたときにカードリーダーの読み取りを開始
	useEffect(() => {
		if (!nfcId || isSubmitting) return;

		const register = async () => {
			const success = await submitAttendance(nfcId, type);
			navigate('/', {
				state: {
					toast: success
						? `Registration was successful!`
						: `Registration was failed..`
				}
			});
		};

		register();
	}, [nfcId]);

	// キャンセルボタンのクリック処理
	const handleCancel = () => {
		cancel();
		navigate('/');
	};

	return (
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
	);
};

export default AttendanceCardWaitPage;
