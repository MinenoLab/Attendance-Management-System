import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <p className="footer-text">
                        © 2026-2028 <strong>Natori Hirofumi, Hidayat Danish Adira</strong>
                    </p>
                    <p className="footer-text footer-affiliation">
                        (MinenoLab, Shizuoka University)
                    </p>
                </div>
                {/* 通常のPC/モバイル用（リンク表示） */}
                <div className="footer-section footer-links">
                    <a 
                        href="https://github.com/MinenoLab/Attendance-Management-System" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="footer-link"
                    >
                        <span className="icon">📦</span> GitHub
                    </a>
                    <span className="separator">|</span>
                    <a 
                        href="natori.hirofumi.22@shizuoka.ac.jp / danish.adira.hidayat.22@shizuoka.ac.jp"
                        className="footer-link"
                    >
                        <span className="icon">✉️</span> Contact
                    </a>
                </div>
                
                {/* 縦型モニター用（テキスト表示） */}
                <div className="footer-section footer-text-only">
                    <span className="footer-text">
                        <strong className="footer-label">GitHub:</strong> MinenoLab/Attendance-Management-System
                    </span>
                    <span className="separator">|</span>
                    <span className="footer-text">
                        <strong className="footer-label">Contact:</strong> mkr.k117@gmail.com
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
