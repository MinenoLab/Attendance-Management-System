import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';

import LoadingPage from './pages/LoadingPage/LoadingPage';
import ErrorPage   from './pages/ErrorPage/ErrorPage';
import HomePage    from './pages/HomePage/HomePage';
import AdminPage   from './pages/AdminPage/AdminPage';

import './App.css';

// アプリケーションのルーティングを定義するコンポーネント
function App() {
	return (
		<Router>
			<Routes>
				{/* ルートパスはLoadingPageにリダイレクト */}
				<Route path="/"      element={<LoadingPage />} />
				<Route path="/views" element={<HomePage />} />
				<Route path="/error" element={<ErrorPage />} />

				{/* 認証が必要な管理者ページへのルート */}
				<Route
					path="/admin"
					element={
						<div className="authenticator-wrapper">
							<Authenticator>
								<AdminPage />
							</Authenticator>
						</div>
					}
				/>

				{/* その他のパスはLoadingPageにリダイレクト */}
				<Route path="*" element={<LoadingPage />} />
			</Routes>
		</Router>
	);
}

export default App;
