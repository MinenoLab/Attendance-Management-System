import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrationPromptPage.css';

const RegistrationPromptPage: React.FC = () => {
    const navigate = useNavigate();

    const handleRetry = () => {
        navigate('/', { replace: true });
    };

    return (
        <div className="registration-prompt-container">
            <div className="registration-box">
                <svg className="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
                <h1 className="registration-title">ユーザー登録が必要です</h1>
                <div className="registration-message">
                    <p className="main-message">
                        現在、登録されているユーザーがいません。
                    </p>
                    <p className="sub-message">
                        新年度のため、全ユーザーの登録データがリセットされました。<br />
                        在室確認システムを利用するには、各ユーザーが再度登録を行う必要があります。
                        ※ 4月1日以外の日にこのメッセージが表示されている場合は、システム管理者にお問い合わせください。
                    </p>
                    <div className="instruction-box">
                        <h3>登録方法</h3>
                        <ol>
                            <li>カードリーダー端末にアクセスしてください</li>
                            <li>「ユーザー登録」メニューを選択</li>
                            <li>必要な情報（学年を間違えないように注意してください）を入力し、カードをスキャンしてください</li>
                        </ol>
                    </div>
                </div>
                <button onClick={handleRetry} className="retry-button">
                    再読み込み
                </button>
            </div>
        </div>
    );
};

export default RegistrationPromptPage;
