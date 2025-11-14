import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage               from './pages/HomePage/HomePage';
import UserSelectPage 	      from './pages/RegisterUser/UserSelectPage';
import UserCardWaitPage 	  from './pages/RegisterUser/UserCardWaitPage';
import AttendanceCardWaitPage from './pages/RegisterAttendance/AttendanceCardWaitPage';

// アプリケーションのルーティングを定義するコンポーネント
function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/register-user"               element={<UserSelectPage />} />
				<Route path="/register-user/waiting"       element={<UserCardWaitPage />} />
				<Route path="/register-attendance/waiting" element={<AttendanceCardWaitPage />} />
			</Routes>
		</Router>
	);
}

export default App;
