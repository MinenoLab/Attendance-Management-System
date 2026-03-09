import React from 'react';
import './MessageBoard.css';

export interface LabMessage {
    id: string;
    sender: string;
    content: string;
    createdAt: string; // ISO文字列などを想定
    priority: 'info' | 'warning' | 'urgent';
}

interface MessageBoardProps {
    messages: LabMessage[];
}

const MessageBoard: React.FC<MessageBoardProps> = ({ messages }) => {
    if (!messages || messages.length === 0) {
        return null;
    }

    // 日付フォーマットのヘルパー関数
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="message-board-container">
            <div className="message-board-header">
                <span className="message-board-icon">📌</span>
                <h2 className="message-board-title">Information Board</h2>
            </div>
            <div className="message-board-list">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-card priority-${msg.priority}`}>
                        <div className="message-header">
                            <span className="message-sender">{msg.sender}</span>
                            <span className="message-time">{formatTime(msg.createdAt)}</span>
                        </div>
                        <div className="message-content">
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageBoard;