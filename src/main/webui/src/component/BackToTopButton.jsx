import React, {useState, useEffect} from 'react';
import {Label} from "@patternfly/react-core";

const BackToTopButton = () => {

    const scrollToTop = () => {
        window.scroll({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="back-to-top">
            <Label color="blue" onClick={() => scrollToTop()} isCompact>
                Back to top
            </Label>
        </div>
    );
};

export default BackToTopButton;
