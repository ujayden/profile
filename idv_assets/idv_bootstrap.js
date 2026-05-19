'use strict';
const defaultTheme = 'dark'; // Accepts 'auto', 'light', or 'dark'
const THEME_STORAGE_KEY_BOOTSTRAP = 'identityv-theme';

(() => {
    const normalizeThemePreference = (value) => (value === 'light' || value === 'dark' ? value : 'auto');
    const getSystemThemePreference = () => (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    let preferredTheme = normalizeThemePreference(defaultTheme);

    try {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY_BOOTSTRAP);
        if (storedTheme !== null) {
            preferredTheme = normalizeThemePreference(storedTheme);
        }
    } catch (error) {
        // Ignore storage errors and fall back to the configured default.
    }

    const resolvedTheme = preferredTheme === 'auto' ? getSystemThemePreference() : preferredTheme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
})();