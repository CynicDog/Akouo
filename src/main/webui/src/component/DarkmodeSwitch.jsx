import React, { useEffect } from 'react';
import { Switch } from "@patternfly/react-core";
import { useTheme } from "../Context.jsx";

const DarkModeSwitch = () => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    const handleToggleTheme = () => {
        toggleTheme();
    };

    useEffect(() => {
        updateHtmlTheme(theme);
    }, [theme]);

    const updateHtmlTheme = (mode) => {
        const htmlElement = document.querySelector('html');

        if (mode === 'dark') {
            htmlElement.setAttribute('data-bs-theme', 'dark');
            htmlElement.classList.add('pf-v5-theme-dark');
        } else {
            htmlElement.removeAttribute('data-bs-theme');
            htmlElement.classList.remove('pf-v5-theme-dark');
        }
    };

    return (
        <Switch
            id="dark-mode-switch"
            isChecked={isDarkMode}
            onChange={handleToggleTheme}
            hasCheckIcon
        />
    );
};

export default DarkModeSwitch;
