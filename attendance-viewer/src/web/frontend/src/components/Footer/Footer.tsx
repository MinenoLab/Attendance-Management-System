import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <p className="footer-text">
                        © 2024-2026 <strong>Kaito Harada</strong>
                    </p>
                    <p className="footer-text footer-affiliation">
                        (MinenoLab, Shizuoka University)
                    </p>
                </div>
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
                        href="mailto:mkr.k117@gmail.com"
                        className="footer-link"
                    >
                        <span className="icon">✉️</span> Contact
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
