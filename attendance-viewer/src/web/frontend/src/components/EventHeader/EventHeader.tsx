import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentDateEvent } from './eventConfig';
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
    // 現在の日付のイベントを取得
    const currentEvent = useMemo(() => {
        return getCurrentDateEvent(currentTime);
    }, [currentTime]);

    // エイプリルフール用の特殊効果（タイトルを上下反転）
    const isAprilFools = currentEvent?.name === "April Fools' Day";

    return (
        <header className="event-header">
            <h1 className={`board-title ${isAprilFools ? 'april-fools' : ''}`}>
                {currentEvent && <span className="event-icon left">{currentEvent.leftIcon}</span>}
                {title}
                {currentEvent && <span className="event-icon right">{currentEvent.rightIcon}</span>}
            </h1>
            
            <div className="header-controls">
                <p className="current-time">
                    {currentTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {currentEvent && <span className="event-badge">{currentEvent.name}</span>}
                </p>
                {showAdminLink && (
                    <Link to="/admin" state={adminLinkState} className="admin-link-button">
                        Admin Menu
                    </Link>
                )}
            </div>
        </header>
    );
};

export default EventHeader;
