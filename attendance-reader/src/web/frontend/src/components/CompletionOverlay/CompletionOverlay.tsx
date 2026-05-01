import React, { useEffect } from 'react';
import './CompletionOverlay.css';

type WikiPerson = {
    title      : string;
    description: string;
    imageUrl  ?: string | null;
};

interface CompletionOverlayProps {
    status  : string;
    person ?: WikiPerson | null;
    onClose : () => void;
}

const CompletionOverlay: React.FC<CompletionOverlayProps> = ({ status, person, onClose }) => {
    const duration = status === 'clock_in' ? 8000 : 3000;

    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="overlay-container">
            {status === 'clock_in' ? (
                <div className="overlay-person">
                    {person?.imageUrl && (
                        <img src={person.imageUrl} alt={person.title} className="overlay-person-image" />
                    )}
                    <p className="overlay-person-name">{person?.title}</p>
                    <p className="overlay-person-quote">{person?.description}</p>
                </div>
            ) : status === 'clock_out' ? (
                <p className="overlay-message">お疲れ様でした！🎉 また明日！</p>
            ) : null}
        </div>
    );
};

export default CompletionOverlay;
