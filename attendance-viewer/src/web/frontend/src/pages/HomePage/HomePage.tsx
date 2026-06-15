import React, { useState, useEffect, useMemo, useRef }         from 'react';
import { useLocation, useNavigate }                            from "react-router-dom";
import type { User, UserStatus, UserIdentifier, FullUserInfo } from '../../types/attendance';
import { useGetSnapshot }                                      from '../../hooks/useGetSnapshot';
import { useGetLast7DaysAttendance }                           from '../../hooks/useGetLast7DaysAttendance';
import { useAttendanceSocket }                                 from '../../hooks/useAttendanceSocket';
import Modal                                                   from '../../components/Modal/Modal';
import Medal                                                   from '../../components/Medal/Medal';
import ContributionGraph, { MiniContributionGraph }            from '../../components/ContributionGraph/ContributionGraph';
import EventHeader                                             from '../../components/EventHeader/EventHeader';
import Footer                                                  from '../../components/Footer/Footer';
import { useMessageSocket }                                    from '../../hooks/useMessageSocket';
import MessageBoard                                            from '../../components/MessageBoard/MessageBoard';
import './HomePage.css';

// 在室状況の表示用ステータス
type DisplayStatus                    = 'Present' | 'Absent';
const STATUS_COLUMNS: DisplayStatus[] = ['Present', 'Absent'];

const ADJUSTMENT_COEFFICIENT = 0.8;

// APIからのステータスを表示用のステータスにマッピングする関数
const mapApiStatusToDisplayStatus = (apiStatus: UserStatus): DisplayStatus | null => {
    switch (apiStatus) {
        case 'clock_in':
        case 'break_out':
        case 'break_in':
            return 'Present';
        case 'clock_out':
            return 'Absent';
        default:
            return null;
    }
};

// ステータスに応じて色を返す関数
const getStatusColorClass = (status: DisplayStatus, realStatus?: UserStatus): string => {
    switch (status) {
        case 'Present':
            // 一時不在（break_in）の場合は黄色、そうでなければ緑色
            return realStatus === 'break_in' ? 'away' : 'present';
        case 'Absent': return 'absent';
        default:
            return 'unknown';
    }
};

// 学年に応じて行のクラスを返す関数
const getGradeRowClass = (grade: string): string => {
    switch (grade) {
        case 'B3': return 'grade-b3';
        case 'B4': return 'grade-b4';
        case 'M1': return 'grade-m1';
        case 'M2': return 'grade-m2';
        case 'RS': return 'grade-researcher';
        default: return '';
    }
};

// 日付をYYYY-MM-DD形式の文字列にフォーマットするヘルパー関数
// タイムゾーン問題を回避するため、ローカル時刻で日付を取得
const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

// ホームページコンポーネント
const HomePage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // ローディングページから渡された状態を取得
    const passedState = location.state as {
        attendanceUsers?: User[];
        allUsers?: UserIdentifier[];
    } | null;
    // 現在の時刻を管理するステート
    const [currentTime, setCurrentTime] = useState(new Date());

    // グラフ表示用モーダルのためのステート
    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [selectedUser, setSelectedUser] = useState<FullUserInfo | null>(null);
    const [startDate, setStartDate]       = useState('');
    const [endDate, setEndDate]           = useState('');

    const [showAdjusted, setShowAdjusted]         = useState(false);
    const [weeklyClassHours, setWeeklyClassHours] = useState<number | ''>(''); 

    const isInitialOpenRef = useRef(true);

    // グラフ用データ取得フックを追加
    const {
        snapshotData,
        isLoading: isSnapshotLoading,
        error: snapshotError,
    } = useGetSnapshot(startDate, endDate, selectedUser?.name);

    const totalAttendance = useMemo(() => {
        if (!snapshotData || !selectedUser) return null;

        const userData = snapshotData[selectedUser.name];
        if (!userData) return null;

        // 期間内の全日付の分数を合計
        const totalMinutes = Object.values(userData).reduce(
            (sum, minutes) => sum + minutes,
            0
        );

        return {
            totalMinutes,
            hours  : Math.floor(totalMinutes / 60),
            minutes: totalMinutes % 60,
            days   : Object.keys(userData).filter(date => userData[date] > 0).length, // 在室日数
        };
    }, [snapshotData, selectedUser]);

    const adjustedAttendance = useMemo(() => {
        if (!totalAttendance || !startDate || !endDate) return null;

        // 期間の週数を算出
        const diffDays = Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime())
            / (1000 * 60 * 60 * 24)
        ) + 1;
        const numberOfWeeks = diffDays / 7;

        const totalHours      = totalAttendance.totalMinutes / 60;
        const adjustedHours   = totalHours * ADJUSTMENT_COEFFICIENT;
        const classHoursTotal = (weeklyClassHours === '' ? 0 : Number(weeklyClassHours)) * numberOfWeeks;
        const finalHours      = adjustedHours - classHoursTotal;

        return {
            totalHours,
            adjustedHours,
            classHoursTotal,
            finalHours,
            numberOfWeeks: Math.round(numberOfWeeks * 10) / 10,
        };
    }, [totalAttendance, weeklyClassHours, startDate, endDate]);

    // 過去7日間のデータを取得するフック
    const {
        last7DaysData,
        isLoading: isLast7DaysLoading,
        error: last7DaysError
    } = useGetLast7DaysAttendance();

    // LoadingPageから渡された2つのリストを結合して，初期ユーザーリストを作成
    const initialUsers = useMemo(() => {
        if (!passedState?.allUsers) return [];

        const attendanceStatusMap = new Map(
            passedState.attendanceUsers?.map(u => [u.name, u.status])
        );

        // allUsersリストとattendanceUsersリストを結合し，ステータスをマッピング
        const combinedUsers: FullUserInfo[] = passedState.allUsers.map(user => ({
            name  : user.name,
            grade : user.grade,
            status: attendanceStatusMap.get(user.name) || 'clock_out'
        }));

        return combinedUsers;
    }, [passedState]);

    // リアルタイムで更新されるユーザーリストを取得するカスタムフック
    const { users: realTimeUsers, error: socketError } = useAttendanceSocket(initialUsers);

    // リアルタイムで更新されるメッセージリストを取得するカスタムフック
    const { messages, error: messageSocketError } = useMessageSocket();

    // ユーザーリストを学年と名前でソートするメモ化された値
    const sortedUsers = useMemo(() => {
        const gradeSortOrder: { [key: string]: number } = { 'RS': 0, 'M2': 1, 'M1': 2, 'B4': 3, 'B3': 4 };
        return [...realTimeUsers].sort((a, b) => {
            const gradeOrderA = gradeSortOrder[a.grade] ?? 99;
            const gradeOrderB = gradeSortOrder[b.grade] ?? 99;
            if (gradeOrderA !== gradeOrderB) {
                return gradeOrderA - gradeOrderB;
            }
            return a.name.localeCompare(b.name, 'ja');
        });
    }, [realTimeUsers]);

    const navigateUser = (direction: 'next' | 'prev') => {
        if (!selectedUser || sortedUsers.length === 0) return;
        isInitialOpenRef.current = false;

        const currentIndex = sortedUsers.findIndex(u => u.name === selectedUser.name);
        let nextIndex: number;

        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % sortedUsers.length;
        } else {
            nextIndex = (currentIndex - 1 + sortedUsers.length) % sortedUsers.length;
        }

        setSelectedUser(sortedUsers[nextIndex]);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isModalOpen) return;
            if (event.key === 'ArrowRight') navigateUser('next');
            if (event.key === 'ArrowLeft')  navigateUser('prev');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, selectedUser, sortedUsers]);

    // 過去7日間で最も在室時間が長いユーザーを特定するメモ化された値
    const topAttendanceUsers = useMemo(() => {
        if (isLast7DaysLoading || last7DaysError || !last7DaysData) {
            return { 1: null, 2: null, 3: null };
        }

        // 各ユーザーの合計在室時間を計算
        const userTotalHours = Object.entries(last7DaysData).map(([userName, dailyData]) => ({
            name: userName,
            totalHours: Object.values(dailyData).reduce((sum, hours) => sum + hours, 0)
        }));

        // 在室時間で降順ソート
        userTotalHours.sort((a, b) => b.totalHours - a.totalHours);

        // トップ3を返す
        return {
            1: userTotalHours[0]?.name || null,
            2: userTotalHours[1]?.name || null,
            3: userTotalHours[2]?.name || null
        };
    }, [last7DaysData, isLast7DaysLoading, last7DaysError]);

    // ユーザーの順位を取得するヘルパー関数
    const getUserRank = (userName: string): 1 | 2 | 3 | null => {
        if (topAttendanceUsers[1] === userName) return 1;
        if (topAttendanceUsers[2] === userName) return 2;
        if (topAttendanceUsers[3] === userName) return 3;
        return null;
    };

    // selectedUserが変更されたら，学年度(4/1～3/31)の日付範囲を設定
    useEffect(() => {
        if (selectedUser && isInitialOpenRef.current) {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            
            let academicStartYear: number;
            if (currentMonth >= 3) {
                academicStartYear = currentYear;
            } else {
                academicStartYear = currentYear - 1;
            }
            
            const firstDay = new Date(academicStartYear, 3, 1);
            const lastDay  = new Date(academicStartYear + 1, 2, 31);
            
            setStartDate(formatDate(firstDay));
            setEndDate(formatDate(lastDay));
        }
    }, [selectedUser]);

    // ページが初期化されたときに，渡された状態が存在しない場合はルートにリダイレクト
    useEffect(() => {
        if (!passedState) {
            navigate('/', { replace: true });
        }
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, [passedState, navigate]);

    // ソケットエラーが発生した場合，エラーページにリダイレクト
    useEffect(() => {
        if (socketError) {
            navigate('/error', {
                replace: true,
                state: { message: `Real-time connection error: ${socketError.message}` }
            });
        }
    }, [socketError, navigate]);

    // モーダル用のハンドラ関数を定義
    const handleUserClick = (user: FullUserInfo) => {
        isInitialOpenRef.current = true;
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="home-page-container">
            <EventHeader
                currentTime={currentTime}
                title="Attendance Status Board"
                showAdminLink={true}
                adminLinkState={{ allUsers: passedState?.allUsers }}
            />

            <MessageBoard messages={messages} />

            <main className="table-container">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th className="name-col">Name</th>
                            {STATUS_COLUMNS.map(colName => (
                                <th key={colName} className="status-col">{colName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.length > 0 ? (
                            sortedUsers.map((user) => {
                                const displayStatus     = mapApiStatusToDisplayStatus(user.status);
                                const userLast7DaysData = last7DaysData[user.name] || {};
                                return (
                                    <tr key={user.name} className={getGradeRowClass(user.grade)}>
                                        <td className="name-cell">
                                            <div className="name-cell-content">
                                                {!isLast7DaysLoading && !last7DaysError && (
                                                    <MiniContributionGraph
                                                        attendanceData={userLast7DaysData}
                                                        className="user-mini-graph"
                                                    />
                                                )}
                                                {/* <span className="user-name-clickable" onClick={() => handleUserClick(user)}>
                                                    {user.name}
                                                </span> */}
                                                {(() => {
                                                    const rank = getUserRank(user.name);
                                                    return (
                                                        <>
                                                            <span
                                                                className={`user-name-clickable ${rank === 1 ? 'user-name-gold' : ''}`}
                                                                onClick={() => handleUserClick(user)}
                                                            >
                                                                {user.name}
                                                            </span>
                                                            {rank && <Medal rank={rank} />}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        {STATUS_COLUMNS.map(colName => (
                                            <td key={colName} className="status-cell">
                                                <span className={`status-marker ${getStatusColorClass(colName, user.status)} ${displayStatus === colName ? 'active' : ''}`}></span>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan={3} className="no-data-cell">No users to display.</td></tr>
                        )}
                    </tbody>
                </table>
            </main>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {selectedUser && (
                    <div style={{ position: 'relative', padding: '0 40px' }}>
                        {/* 左矢印ボタン */}
                        <button 
                            onClick={() => navigateUser('prev')}
                            style={{
                                position: 'absolute', left: '-10px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: '#ccc'
                            }}
                            title="前のユーザーへ (←)"
                        >
                            &#10094;
                        </button>

                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }} />
                            <span style={{ fontWeight: 'bold' }}> 〜 </span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }} />
                        </div>

                        {!isSnapshotLoading && !snapshotError && totalAttendance && (
                            <div className="attendance-summary">
                                <div className="attendance-summary-item">
                                    <div className="attendance-summary-value">
                                        {totalAttendance.hours}<span>h</span>
                                        {' '}
                                        {totalAttendance.minutes}<span>m</span>
                                    </div>
                                    <div className="attendance-summary-label">合計在室時間</div>
                                </div>

                                <div className="attendance-summary-divider" />

                                <div className="attendance-summary-item">
                                    <div className="attendance-summary-value">
                                        {totalAttendance.days}<span>days</span>
                                    </div>
                                    <div className="attendance-summary-label">在室日数</div>
                                </div>

                                <div className="attendance-summary-divider" />

                                <div className="attendance-summary-item">
                                    <div className="attendance-summary-value">
                                        {totalAttendance.days > 0
                                            ? (totalAttendance.totalMinutes / totalAttendance.days / 60).toFixed(1)
                                            : '0.0'}
                                        <span>h</span>
                                    </div>
                                    <div className="attendance-summary-label">1日平均</div>
                                </div>
                            </div>
                        )}

                        {!isSnapshotLoading && !snapshotError && totalAttendance && (
                            <div className="adjusted-section">

                                <button
                                    onClick={() => setShowAdjusted(prev => !prev)}
                                    className="adjusted-toggle-button"
                                >
                                    <span className="adjusted-toggle-icon">{showAdjusted ? '▲' : '▼'}</span>
                                    調整後在室時間を計算
                                </button>

                                {showAdjusted && adjustedAttendance && (
                                    <div className="adjusted-panel">

                                        <div className="adjusted-input-row">
                                            <label>週当たりの授業時間</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                value={weeklyClassHours}
                                                onChange={e => setWeeklyClassHours(
                                                    e.target.value === '' ? '' : Number(e.target.value)
                                                )}
                                            />
                                            <span>時間 / 週</span>
                                        </div>

                                        <div className="adjusted-breakdown">

                                            <div className="adjusted-breakdown-row">
                                                <span className="label">合計在室時間</span>
                                                <span>{adjustedAttendance.totalHours.toFixed(1)} h</span>
                                            </div>

                                            <div className="adjusted-breakdown-row">
                                                <span className="label">× 調整係数（{ADJUSTMENT_COEFFICIENT}）</span>
                                                <span>{adjustedAttendance.adjustedHours.toFixed(1)} h</span>
                                            </div>

                                            <div className="adjusted-breakdown-row">
                                                <span className="label">
                                                    − 授業時間合計
                                                    {weeklyClassHours !== '' && weeklyClassHours > 0 && (
                                                        <span className="sub-label">
                                                            （{weeklyClassHours}h × {adjustedAttendance.numberOfWeeks}週）
                                                        </span>
                                                    )}
                                                </span>
                                                <span>
                                                    {weeklyClassHours === '' || weeklyClassHours === 0
                                                        ? '─'
                                                        : `${adjustedAttendance.classHoursTotal.toFixed(1)} h`
                                                    }
                                                </span>
                                            </div>

                                            <div className="adjusted-divider" />

                                            <div className="adjusted-result-row">
                                                <span>調整後在室時間</span>
                                                <span className={`adjusted-result-value ${adjustedAttendance.finalHours < 0 ? 'negative' : ''}`}>
                                                    {adjustedAttendance.finalHours.toFixed(1)} h
                                                </span>
                                            </div>

                                            {adjustedAttendance.finalHours < 0 && (
                                                <div className="adjusted-warning">
                                                    ※ 授業時間が調整後在室時間を上回っています
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(isSnapshotLoading || snapshotError) ? (
                            <div className="modal-status-container">
                                {isSnapshotLoading && <p>Loading graph...</p>}
                                {snapshotError && <p className="error-message">Failed to load graph: {snapshotError.message}</p>}
                            </div>
                        ) : (
                            <ContributionGraph
                                userName={selectedUser.name}
                                startDate={startDate}
                                endDate={endDate}
                                dailyData={snapshotData?.[selectedUser.name] || {}}
                            />
                        )}

                        {/* 右矢印ボタン */}
                        <button 
                            onClick={() => navigateUser('next')}
                            style={{
                                position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: '#ccc'
                            }}
                            title="次のユーザーへ (→)"
                        >
                            &#10095;
                        </button>
                    </div>
                )}
            </Modal>
            <Footer />
        </div>
    );
};

export default HomePage;