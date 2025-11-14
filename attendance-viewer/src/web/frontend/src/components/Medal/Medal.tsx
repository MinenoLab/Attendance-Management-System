import React from 'react';
import './Medal.css';

interface MedalProps {
    rank: 1 | 2 | 3;
    className?: string;
}

const Medal: React.FC<MedalProps> = ({ rank, className = '' }) => {
    const getMedalColor = () => {
        switch (rank) {
            case 1: return { primary: '#FFD700', secondary: '#FFA500', tertiary: '#FF8C00' }; // 金
            case 2: return { primary: '#C0C0C0', secondary: '#A8A8A8', tertiary: '#808080' }; // 銀
            case 3: return { primary: '#CD7F32', secondary: '#B8860B', tertiary: '#8B4513' }; // 銅
        }
    };

    const colors = getMedalColor();
    const rankText = rank.toString();

    return (
        <div className={`medal medal-${rank} ${className}`} title={`過去7日間で在室時間${rank}位のユーザー`}>
            <svg 
                width="60" 
                height="60" 
                viewBox="0 0 120 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* メダルの外枠 */}
                <circle 
                    cx="60" 
                    cy="60" 
                    r="55" 
                    fill={`url(#medalGradient${rank})`}
                    stroke={colors.secondary}
                    strokeWidth="3"
                />
                
                {/* メダルの内側 */}
                <circle 
                    cx="60" 
                    cy="60" 
                    r="45" 
                    fill={`url(#innerGradient${rank})`}
                    stroke={colors.tertiary}
                    strokeWidth="2"
                />
                
                {/* 順位の数字（さらに大きくした） */}
                <text 
                    x="60" 
                    y="75" 
                    textAnchor="middle" 
                    fontSize="52" 
                    fontWeight="bold" 
                    fill="white"
                    stroke="#333"
                    strokeWidth="2.5"
                    fontFamily="Arial, sans-serif"
                >
                    {rankText}
                </text>
                
                {/* 強化されたキラキラエフェクト */}
                <g fill="white" opacity="0.9">
                    {/* 大きなキラキラ */}
                    <circle cx="25" cy="35" r="4">
                        <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="r" values="3;5;3" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="95" cy="40" r="3.5">
                        <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
                        <animate attributeName="r" values="2.5;4.5;2.5" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="30" cy="85" r="3">
                        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="90" cy="80" r="3.5">
                        <animate attributeName="opacity" values="1;0.3;1" dur="2.1s" repeatCount="indefinite" />
                        <animate attributeName="r" values="3;5;3" dur="2.1s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* 中サイズのキラキラ */}
                    <circle cx="40" cy="25" r="2.5">
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.7s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="80" cy="30" r="2">
                        <animate attributeName="opacity" values="1;0.4;1" dur="2.3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="35" cy="100" r="2.5">
                        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.9s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="85" cy="95" r="2">
                        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* 星型のキラキラ */}
                    <g>
                        <path d="M20 50 L22 55 L27 55 L23 58 L25 63 L20 60 L15 63 L17 58 L13 55 L18 55 Z">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                            <animateTransform 
                                attributeName="transform" 
                                type="rotate" 
                                values="0 20 58;360 20 58" 
                                dur="4s" 
                                repeatCount="indefinite"
                            />
                        </path>
                        <path d="M100 55 L102 60 L107 60 L103 63 L105 68 L100 65 L95 68 L97 63 L93 60 L98 60 Z">
                            <animate attributeName="opacity" values="1;0.2;1" dur="2.4s" repeatCount="indefinite" />
                            <animateTransform 
                                attributeName="transform" 
                                type="rotate" 
                                values="180 100 63;540 100 63" 
                                dur="3.5s" 
                                repeatCount="indefinite"
                            />
                        </path>
                    </g>
                    
                    {/* 十字のキラキラ（拡張） */}
                    <g>
                        <path d="M110 20 L113 17 L116 20 L113 23 Z">
                            <animateTransform 
                                attributeName="transform" 
                                type="rotate" 
                                values="0 113 20;360 113 20" 
                                dur="2.8s" 
                                repeatCount="indefinite"
                            />
                            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.4s" repeatCount="indefinite" />
                        </path>
                        <path d="M10 90 L13 87 L16 90 L13 93 Z">
                            <animateTransform 
                                attributeName="transform" 
                                type="rotate" 
                                values="180 13 90;540 13 90" 
                                dur="2.2s" 
                                repeatCount="indefinite"
                            />
                            <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
                        </path>
                        <path d="M105 110 L108 107 L111 110 L108 113 Z">
                            <animateTransform 
                                attributeName="transform" 
                                type="rotate" 
                                values="0 108 110;360 108 110" 
                                dur="3.2s" 
                                repeatCount="indefinite"
                            />
                            <animate attributeName="opacity" values="0.7;1;0.7" dur="1.6s" repeatCount="indefinite" />
                        </path>
                    </g>
                </g>
                
                {/* グラデーション定義 */}
                <defs>
                    <radialGradient id={`medalGradient${rank}`} cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor={colors.primary} />
                        <stop offset="70%" stopColor={colors.secondary} />
                        <stop offset="100%" stopColor={colors.tertiary} />
                    </radialGradient>
                    <radialGradient id={`innerGradient${rank}`} cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor={colors.secondary} />
                        <stop offset="100%" stopColor={colors.tertiary} />
                    </radialGradient>
                </defs>
            </svg>
        </div>
    );
};

export default Medal;