import React from 'react';
import './Crown.css';

interface CrownProps {
    className?: string;
}

const Crown: React.FC<CrownProps> = ({ className = '' }) => {
    return (
        <div className={`crown ${className}`} title="過去7日間で最も在室時間が長いユーザー">
            <svg 
                width="40" 
                height="40" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* メインの星 */}
                <path
                    d="M50 10 L60 35 L85 35 L66 50 L75 75 L50 60 L25 75 L34 50 L15 35 L40 35 Z"
                    fill="url(#goldGradient)"
                    stroke="#FFD700"
                    strokeWidth="2"
                />
                
                {/* 小さなキラキラ */}
                <circle cx="30" cy="25" r="3" fill="#FFF">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="70" cy="30" r="2.5" fill="#FFF">
                    <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="25" cy="55" r="2" fill="#FFF">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="75" cy="65" r="2.5" fill="#FFF">
                    <animate attributeName="opacity" values="1;0.2;1" dur="2.2s" repeatCount="indefinite" />
                </circle>
                
                {/* 十字のキラキラ */}
                <g fill="#FFF" opacity="0.8">
                    <path d="M90 20 L92 18 L94 20 L92 22 Z">
                        <animateTransform 
                            attributeName="transform" 
                            type="rotate" 
                            values="0 92 20;360 92 20" 
                            dur="3s" 
                            repeatCount="indefinite"
                        />
                    </path>
                    <path d="M10 70 L12 68 L14 70 L12 72 Z">
                        <animateTransform 
                            attributeName="transform" 
                            type="rotate" 
                            values="180 12 70;540 12 70" 
                            dur="2.5s" 
                            repeatCount="indefinite"
                        />
                    </path>
                </g>
                
                {/* グラデーション定義 */}
                <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD700" />
                        <stop offset="50%" stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#FF8C00" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default Crown;