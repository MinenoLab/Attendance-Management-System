import React, { useState, useEffect }      from 'react';
import { useLocation }                     from 'react-router-dom';
import { fetchAuthSession }                from '@aws-amplify/auth';
import { useAuthenticator }                from '@aws-amplify/ui-react';
import { useUpdateAttendanceAdmin }        from '../../hooks/useUpdateAttendanceAdmin';
import { useSendMessageAdmin }             from '../../hooks/useSendMessageAdmin';
import type { UserStatus, UserIdentifier } from '../../types/attendance';
import { LabMessage }                      from '../../components/MessageBoard/MessageBoard';
import './AdminPage.css';

const AdminPage = () => {
    const { user, signOut }                                 = useAuthenticator((context) => [context.user, context.signOut]);
    const { updateAttendance, isLoading, error, isSuccess } = useUpdateAttendanceAdmin();
    const location                                          = useLocation();
    const [isAdmin, setIsAdmin]                             = useState<boolean>(false);
    const allUsers                                          = (location.state?.allUsers as UserIdentifier[]) || [];
    const [targetName, setTargetName]                       = useState<string>('');
    const [targetStatus, setTargetStatus]                   = useState<UserStatus>('clock_in');

    // カスタムフックから送信関数と各ステータスを取得
    const { 
        sendMessage, 
        isLoading: isMsgSending, 
        error: msgError, 
        isSuccess: msgSuccess 
    } = useSendMessageAdmin();

    // フォーム入力用のState
    const [msgSender, setMsgSender]         = useState<string>('');
    const [msgPriority, setMsgPriority]     = useState<LabMessage['priority']>('info');
    const [msgContent, setMsgContent]       = useState<string>('');
    
    // 管理者かどうかを判定するためのuseEffect
    useEffect(() => {
        const checkAdminStatus = async () => {
        try {
            const session = await fetchAuthSession();
            const groups  = session.tokens?.idToken?.payload['cognito:groups'] as string[] || [];
            setIsAdmin(groups.includes('Admins'));
        } catch (e) {
            console.error("セッションの取得に失敗しました．", e);
            setIsAdmin(false);
        }
        };
        checkAdminStatus();
    }, []);

    // ユーザーリストが変更されたときに，初期値を設定するためのuseEffect
    useEffect(() => {
        if (allUsers.length > 0 && !targetName) {
            setTargetName(allUsers[0].name);
        }
    }, [allUsers, targetName]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!targetName) {
            alert('更新対象のユーザーを選択してください．');
            return;
        }
        updateAttendance(targetName, targetStatus);
    };

    // 伝言掲示板への送信ハンドラ
    const handleMessageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!msgSender.trim() || !msgContent.trim()) {
            alert('送信者とメッセージ内容を入力してください．');
            return;
        }

        try {
            // カスタムフックの送信関数を呼び出す
            await sendMessage(msgSender, msgPriority, msgContent);
            
            // 成功した場合は、次のメッセージをすぐに打てるようにテキストエリアだけクリアする
            setMsgContent(''); 
        } catch (err) {
            // エラーは useSendMessageAdmin フック内で処理され、msgErrorにセットされるため、
            // ここではコンソールへの出力にとどめるか、そのまま握りつぶしてもUIにエラーが表示されます
            console.error("メッセージ送信エラー:", err);
        }
    };

    return (
        <div className="admin-page-wrapper">
            <main className="admin-page-container">
                <header className="admin-header">
                    <h1 className="admin-title">管理者ページ</h1>
                    <button onClick={signOut} className="signout-button">サインアウト</button>
                </header>

                <p>ようこそ, {user?.signInDetails?.loginId || user?.username} さん</p>

                {isAdmin ? (
                    <div className="admin-contents">
                        
                        {/* セクション1: 在席状況の手動更新 */}
                        <section className="admin-section">
                            <h2 className="section-title">在席状況の手動更新</h2>
                            <form onSubmit={handleSubmit} className="update-form">
                                <div className="form-group">
                                    <label htmlFor="name-select">ユーザー名</label>
                                    <select
                                        id="name-select"
                                        value={targetName}
                                        onChange={(e) => setTargetName(e.target.value)}
                                        required
                                        disabled={allUsers.length === 0}
                                    >
                                        {allUsers.length > 0 ? (
                                        allUsers.map((u) => (
                                            <option key={u.name} value={u.name}>
                                            【{u.grade}】{u.name}
                                            </option>
                                        ))
                                        ) : (
                                        <option disabled>ユーザーリストがありません</option>
                                        )}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status-select">新しいステータス</label>
                                    <select id="status-select" value={targetStatus} onChange={(e) => setTargetStatus(e.target.value as UserStatus)}>
                                        <option value="clock_in">🟢在室</option>
                                        <option value="break_in">🟡休憩中</option>
                                        <option value="clock_out">⚫退室</option>
                                    </select>
                                </div>
                                <button type="submit" className="update-button" disabled={isLoading || allUsers.length === 0}>
                                    {isLoading ? '更新中...' : '在席情報を更新'}
                                </button>
                            </form>
                            {isSuccess && <p className="success-message">更新に成功しました．</p>}
                            {error && <p className="error-message">エラー: {error.message}</p>}
                        </section>

                        <hr className="admin-divider" />

                        {/* セクション2: 伝言板へのメッセージ配信 */}
                        <section className="admin-section">
                            <h2 className="section-title">伝言板へのメッセージ配信</h2>
                            <form onSubmit={handleMessageSubmit} className="update-form">
                                <div className="form-group">
                                    <label htmlFor="msg-sender">送信者</label>
                                    <input 
                                        id="msg-sender"
                                        type="text" 
                                        value={msgSender} 
                                        onChange={(e) => setMsgSender(e.target.value)} 
                                        placeholder="例: 峰野，事務" 
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="msg-priority">優先度（緊急度）</label>
                                    <select 
                                        id="msg-priority"
                                        value={msgPriority} 
                                        onChange={(e) => setMsgPriority(e.target.value as LabMessage['priority'])}
                                    >
                                        <option value="info">🔵 お知らせ (Info)</option>
                                        <option value="warning">🟡 注意 (Warning)</option>
                                        <option value="urgent">🔴 緊急 (Urgent)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="msg-content">メッセージ内容</label>
                                    <textarea 
                                        id="msg-content"
                                        value={msgContent} 
                                        onChange={(e) => setMsgContent(e.target.value)} 
                                        placeholder="伝言の内容を入力してください．"
                                        rows={4}
                                        required
                                    />
                                </div>

                                {/* ★ isMsgSending を使って送信中の連打を防止 */}
                                <button type="submit" className="update-button message-submit-btn" disabled={isMsgSending}>
                                    {isMsgSending ? '送信中...' : '掲示板に送信する'}
                                </button>
                            </form>
                            {/* ★ カスタムフックが返してくる成功・エラー状態を表示 */}
                            {msgSuccess && <p className="success-message">メッセージを配信しました．</p>}
                            {msgError && <p className="error-message">エラー: {msgError.message}</p>}
                        </section>

                    </div>
                ) : (
                    <div className="admin-contents">
                        <p className="error-message">このページを閲覧する権限がありません．</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminPage;