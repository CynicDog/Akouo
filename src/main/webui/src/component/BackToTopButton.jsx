import React, { useState, useEffect } from 'react';
import {Label} from "@patternfly/react-core";

const BackToTopButton = () => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 500) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scroll({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="back-to-top">
            {showButton && (
                <Label color="blue" onClick={() => scrollToTop()} isCompact>
                    Back to top
                </Label>
            )}
        </div>
    );
};

export default BackToTopButton;
