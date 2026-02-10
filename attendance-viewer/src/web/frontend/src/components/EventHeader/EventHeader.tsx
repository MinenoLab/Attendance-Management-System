import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentDateEvent, DATE_EVENTS } from './eventConfig';
import './EventHeader.css';

interface EventHeaderProps {
    currentTime: Date;
    title: string;
    showAdminLink?: boolean;
    adminLinkState?: any;
    testMode?: boolean; // テストモード用
}

const EventHeader: React.FC<EventHeaderProps> = ({ 
    currentTime, 
    title, 
    showAdminLink = false,
    adminLinkState,
    testMode = false
}) => {
    const [testDate, setTestDate] = useState<Date | null>(null);
    const [showTestPanel, setShowTestPanel] = useState(false);
    
    // テストモードの日付を使用するか、実際の日付を使用するか
    const effectiveDate = testDate || currentTime;
    
    // 現在の日付イベントを取得
    const currentEvent = useMemo(() => getCurrentDateEvent(effectiveDate), [effectiveDate]);

    // テスト用：イベントを選択
    const handleEventSelect = (eventIndex: number) => {
        if (eventIndex === -1) {
            setTestDate(null); // 通常に戻す
        } else {
            const event = DATE_EVENTS[eventIndex];
            const testYear = new Date().getFullYear();
            setTestDate(new Date(testYear, event.startMonth - 1, event.startDay));
        }
    };

    // エイプリルフールの特別処理
    const isAprilFool = currentEvent?.colorClass === 'event-april-fool';

    return (
        <>
            <header className={`event-header ${currentEvent?.colorClass || ''}`}>
                {currentEvent && <div className="event-decoration"></div>}
                
                <h1 className={`board-title ${isAprilFool ? 'april-fool-title' : ''}`}>
                    {title}
                </h1>
                
                {currentEvent?.name && (
                    <div className="event-badge">{currentEvent.name}</div>
                )}
                
                <p className="current-time">
                    {effectiveDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}&nbsp;
                    {effectiveDate.toLocaleTimeString('en-US')}
                </p>
                
                {showAdminLink && (
                    <Link to="/admin" state={adminLinkState} className="admin-link-button">
                        Admin Menu
                    </Link>
                )}
                
                {/* テストモード用のコントロール */}
                {testMode && (
                    <button 
                        className="test-mode-toggle"
                        onClick={() => setShowTestPanel(!showTestPanel)}
                    >
                        🎨 Test Events
                    </button>
                )}
            </header>
            
            {/* テストパネル */}
            {testMode && showTestPanel && (
                <div className="event-test-panel">
                    <h3>🎭 イベントテストモード</h3>
                    <div className="event-test-buttons">
                        <button onClick={() => handleEventSelect(-1)}>
                            ❌ 通常表示
                        </button>
                        {DATE_EVENTS.map((event, index) => (
                            <button 
                                key={index}
                                onClick={() => handleEventSelect(index)}
                                className={testDate && getCurrentDateEvent(testDate)?.colorClass === event.colorClass ? 'active' : ''}
                            >
                                {event.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default EventHeader;
