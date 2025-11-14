import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentTime } 			from '../../hooks/useCurrentTime';
import { useEffect, useState } 		from 'react';
import './HomePage.css';

const statusMap: Record<string, string> = {
	'在室': 'clock_in',
	'休入': 'break_in',
	'休出': 'break_out',
	'不在': 'clock_out'
};

const HomePage = () => {
	const navigate 		 	= useNavigate();
	const location 		 	= useLocation();
	const { date, time } 	= useCurrentTime();
	const [toast, setToast] = useState<string | null>(null);

	// トーストメッセージの表示処理
	useEffect(() => {
		if (location.state?.toast) {
			setToast(location.state.toast);
			const timer = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [location.state]);

	// ページがマウントされたときにカードリーダーの読み取りを開始
	const handleAttendanceClick = (label: string) => {
		const status = statusMap[label];
		navigate('/register-attendance/waiting', { state: { type: status } });
	};

	// ユーザー登録ボタンのクリック処理
	const handleRegisterClick = () => {
		navigate('/register-user');
	};

	return (
		<div id="home-page" className="animated-bg">
			{toast && <div className="toast">{toast}</div>}

			<div id="clock">
				<div className="clock-date">{date}</div>
				<div className="clock-time">{time}</div>
			</div>

			<div id="attendance-buttons">
				<button onClick={() => handleAttendanceClick('在室')}>
					在室<br /><small>Clock In</small>
				</button>
				<button onClick={() => handleAttendanceClick('休入')}>
					休入<br /><small>Break Start</small>
				</button>
				<button onClick={() => handleAttendanceClick('休出')}>
					休出<br /><small>Break End</small>
				</button>
				<button onClick={() => handleAttendanceClick('不在')}>
					不在<br /><small>Clock Out</small>
				</button>
			</div>

			<button onClick={handleRegisterClick} id="user-register-button">
				ユーザー登録<br /><small>User Registration</small>
			</button>
		</div>
	);
};

export default HomePage;
