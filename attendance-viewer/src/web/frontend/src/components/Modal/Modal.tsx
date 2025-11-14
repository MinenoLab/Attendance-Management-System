import React, { useEffect, useState } from 'react';
import './Modal.css';

interface ModalProps {
    isOpen  : boolean;
    onClose : () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        }
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) {
            setIsRendered(false);
        }
    };

    if (!isRendered) {
        return null;
    }

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} onAnimationEnd={handleAnimationEnd}>
            <div className={`modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <button className="modal-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;