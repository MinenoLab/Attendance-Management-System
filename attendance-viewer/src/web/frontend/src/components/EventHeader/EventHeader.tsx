import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentDateEvent, DATE_EVENTS } from './eventConfig';
import './EventHeader.css';

interface EventHeaderProps {
    currentTime: Date;
    title: string;
    showAdminLink?: boolean;
    adminLinkState?: any;
}

const EventHeader: React.FC<EventHeaderProps> = ({ 
    currentTime, 
    title, 
    showAdminLink = false,
    adminLinkState 
}) => {
    // テストモード用のステート
    const [testMode, setTestMode] = useState(false);
    const [selectedTestEventIndex, setSelectedTestEventIndex] = useState<number | null>(null);

    // テストモード時は選択されたイベント、通常時は現在の日付のイベントを取得
    const currentEvent = useMemo(() => {
        if (testMode && selectedTestEventIndex !== null) {
            return DATE_EVENTS[selectedTestEventIndex];
        }
        return getCurrentDateEvent(currentTime);
    }, [currentTime, testMode, selectedTestEventIndex]);

    // エイプリルフール用の特殊効果（タイトルを上下反転）
    const isAprilFools = currentEvent?.name === 'エイプリルフール';

    return (
        <>
            <header className="event-header">
                <h1 className={`board-title ${isAprilFools ? 'april-fools' : ''}`}>
                    {currentEvent && <span className="event-icon left">{currentEvent.leftIcon}</span>}
                    {title}
                    {currentEvent && <span className="event-icon right">{currentEvent.rightIcon}</span>}
                </h1>
                
                <div className="header-controls">
                    <p className="current-time">
                        {currentTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}&nbsp;
                        {currentTime.toLocaleTimeString('en-US')}
                        {currentEvent && <span className="event-badge">{currentEvent.name}</span>}
                    </p>
                    {showAdminLink && (
                        <Link to="/admin" state={adminLinkState} className="admin-link-button">
                            Admin Menu
                        </Link>
                    )}
                </div>
                
                {/* テストモード切替ボタン */}
                <button 
                    className="test-mode-toggle"
                    onClick={() => {
                        setTestMode(!testMode);
                        if (testMode) setSelectedTestEventIndex(null);
                    }}
                    title="イベントテストモード"
                >
                    {testMode ? '📅 ✅' : '📅'}
                </button>
            </header>

            {/* テストモードパネル */}
            {testMode && (
                <div className="test-mode-panel">
                    <h3>🎨 イベントテストモード</h3>
                    <div className="event-selector">
                        <button 
                            onClick={() => setSelectedTestEventIndex(null)}
                            className={selectedTestEventIndex === null ? 'active' : ''}
                        >
                            イベントなし
                        </button>
                        {DATE_EVENTS.map((event, index) => (
                            <button 
                                key={index}
                                onClick={() => setSelectedTestEventIndex(index)}
                                className={selectedTestEventIndex === index ? 'active' : ''}
                            >
                                {event.leftIcon} {event.name} {event.rightIcon}
                                <span className="event-period">
                                    ({event.startMonth}/{event.startDay}
                                    {event.endMonth && event.endDay && ` - ${event.endMonth}/${event.endDay}`})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default EventHeader;
