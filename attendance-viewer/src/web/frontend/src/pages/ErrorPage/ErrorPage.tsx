import React                        from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ErrorPage.css';

const ErrorPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // エラーメッセージを取得
    const errorMessage = location.state?.message || '不明なエラーが発生しました．';
    // 再試行ボタンがクリックされたときの処理
    const handleRetry = () => {
        navigate('/', { replace: true });
    };

    return (
        <div className="error-page-container">
            <div className="error-box">
                <svg className="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <h1 className="error-title">問題が発生しました</h1>
                <p className="error-message-label">エラー内容：</p>
                <code className="error-message-details">{errorMessage}</code>
                <button onClick={handleRetry} className="retry-button">再試行</button>
            </div>
        </div>
    );
};

export default ErrorPage;