'use strict';
const THEME_STORAGE_KEY = 'identityv-theme';
const THEME_LABELS = {
    auto: 'Auto',
    light: 'Light',
    dark: 'Dark'
};
const THEME_SEQUENCE = ['auto', 'light', 'dark'];

let currentThemePreference = 'auto';
let themeMediaQuery = null;
let themeMediaListener = null;
const I18N_ASSET_URLS = {
    en: '/idv_assets/idv_en.json',
    'zh-Hant': '/idv_assets/idv_zh_Hant.json',
    'zh-Hans': '/idv_assets/idv_zh_Hans.json',
    ja: '/idv_assets/idv_ja.json'
};
const I18N_LANGUAGE_ALIASES = {
    en: 'en',
    'zh-tw': 'zh-Hant',
    'zh-hant': 'zh-Hant',
    'zh-hk': 'zh-Hant',
    'zh-mo': 'zh-Hant',
    'zh-cn': 'zh-Hans',
    'zh-hans': 'zh-Hans',
    'zh-sg': 'zh-Hans',
    ja: 'ja',
    'ja-jp': 'ja'
};
let translationCache = {};
let activeLanguage = 'en';
const BASIC_PROFILE_DATA_URL = '/idv_assets/idv_basic_data.json';
let basicProfileDataCache = null;

function normalizeThemePreference(value) {
    return value === 'light' || value === 'dark' ? value : 'auto';
}

function readStoredThemePreference() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
        return null;
    }
}

function getInitialThemePreference() {
    const storedPreference = readStoredThemePreference();
    if (storedPreference !== null) {
        return normalizeThemePreference(storedPreference);
    }

    return normalizeThemePreference(typeof defaultTheme === 'undefined' ? 'auto' : defaultTheme);
}

function getSystemThemePreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(preference) {
    const selectedPreference = normalizeThemePreference(preference);
    return selectedPreference === 'auto' ? getSystemThemePreference() : selectedPreference;
}

function getNextThemePreference(preference) {
    const selectedPreference = normalizeThemePreference(preference);
    const currentIndex = THEME_SEQUENCE.indexOf(selectedPreference);
    return THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length];
}

function persistThemePreference(preference) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, normalizeThemePreference(preference));
    } catch (error) {
        // Ignore storage failures; the page still works without persistence.
    }
}

function syncThemeController(preference) {
    const selectedPreference = normalizeThemePreference(preference);
    const themeTrigger = document.getElementById('theme-toggle-trigger');
    const activeLabel = THEME_LABELS[selectedPreference];
    const nextLabel = THEME_LABELS[getNextThemePreference(selectedPreference)];

    if (themeTrigger) {
        themeTrigger.setAttribute('aria-label', `Theme: ${activeLabel}. Click to switch to ${nextLabel}.`);
        themeTrigger.setAttribute('data-theme-state', selectedPreference);
    }
}

function applyThemePreference(preference, options = {}) {
    const selectedPreference = normalizeThemePreference(preference);
    const resolvedPreference = resolveEffectiveTheme(selectedPreference);

    document.documentElement.setAttribute('data-theme', resolvedPreference);
    document.documentElement.style.colorScheme = resolvedPreference;
    currentThemePreference = selectedPreference;

    if (options.persist) {
        persistThemePreference(selectedPreference);
    }

    syncThemeController(selectedPreference);
}

function syncThemePreferenceFromMediaQuery() {
    if (currentThemePreference !== 'auto') {
        return;
    }

    applyThemePreference('auto');
}

function bindSystemThemeListener() {
    if (themeMediaQuery) {
        return;
    }

    themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    themeMediaListener = syncThemePreferenceFromMediaQuery;

    if (typeof themeMediaQuery.addEventListener === 'function') {
        themeMediaQuery.addEventListener('change', themeMediaListener);
    } else if (typeof themeMediaQuery.addListener === 'function') {
        themeMediaQuery.addListener(themeMediaListener);
    }
}

function initThemeController() {
    const themeTrigger = document.getElementById('theme-toggle-trigger');

    applyThemePreference(getInitialThemePreference());
    bindSystemThemeListener();

    if (themeTrigger) {
        themeTrigger.addEventListener('click', () => {
            const nextPreference = getNextThemePreference(currentThemePreference);
            applyThemePreference(nextPreference, { persist: true });
        });
    }

    window.addEventListener('storage', event => {
        if (event.key === THEME_STORAGE_KEY || event.key === null) {
            applyThemePreference(getInitialThemePreference());
        }
    });
}

function setLocalizedTextNode(element, value) {
    if (!element) {
        return;
    }

    if (element.tagName && element.tagName.toLowerCase() === 'title') {
        element.textContent = value;
        document.title = value;
        return;
    }

    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
    const contentTextNodes = textNodes.filter(node => node.textContent.trim().length > 0);

    if (element.childElementCount > 0) {
        if (contentTextNodes.length === 0) {
            return;
        }

        const targetNode = contentTextNodes[contentTextNodes.length - 1];
        const originalText = targetNode.textContent;
        const leadingWhitespace = originalText.match(/^\s*/)?.[0] ?? '';
        const trailingWhitespace = originalText.match(/\s*$/)?.[0] ?? '';
        targetNode.textContent = `${leadingWhitespace}${value}${trailingWhitespace}`;
        return;
    }

    element.textContent = value;
}

function normalizeLanguageCode(languageCode) {
    if (!languageCode) {
        return 'en';
    }

    if (languageCode === 'auto') {
        return 'auto';
    }

    const normalized = (languageCode || 'en').toLowerCase();
    return I18N_LANGUAGE_ALIASES[normalized] || 'en';
}

function getLanguageAssetUrl(languageCode) {
    return I18N_ASSET_URLS[languageCode] || I18N_ASSET_URLS.en;
}

function detectBrowserLanguage() {
    const candidates = [];

    if (Array.isArray(navigator.languages)) {
        candidates.push(...navigator.languages);
    }
    if (navigator.language) {
        candidates.push(navigator.language);
    }

    for (const candidate of candidates) {
        const normalized = String(candidate || '').toLowerCase();
        if (!normalized) {
            continue;
        }

        if (normalized.startsWith('zh')) {
            if (normalized.includes('hant') || normalized.includes('tw') || normalized.includes('hk') || normalized.includes('mo')) {
                return 'zh-Hant';
            }

            if (normalized.includes('hans') || normalized.includes('cn') || normalized.includes('sg')) {
                return 'zh-Hans';
            }
        }

        if (normalized.startsWith('ja')) {
            return 'ja';
        }

        if (normalized.startsWith('en')) {
            return 'en';
        }
    }

    return 'en';
}

function applyLanguage(languageCode) {
    const translations = translationCache[languageCode];

    if (!translations || Object.keys(translations).length === 0) {
        return;
    }

    document.documentElement.lang = languageCode;
    document.documentElement.dir = 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const value = translations[key];

        if (typeof value !== 'string') {
            return;
        }

        if (element.id === 'theme-toggle-trigger') {
            return;
        }

        setLocalizedTextNode(element, value);
    });

    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        const value = translations[key];

        if (typeof value === 'string') {
            element.innerHTML = value;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const value = translations[key];

        if (typeof value === 'string') {
            element.setAttribute('placeholder', value);
        }
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
        if (element.id === 'theme-toggle-trigger') {
            return;
        }

        const key = element.getAttribute('data-i18n-aria-label');
        const value = translations[key];

        if (typeof value === 'string') {
            element.setAttribute('aria-label', value);
        }
    });

}

async function loadLanguage(languageCode) {
    const requestedLanguage = normalizeLanguageCode(languageCode);
    const normalizedLanguage = requestedLanguage === 'auto' ? detectBrowserLanguage() : requestedLanguage;

    try {
        document.documentElement.lang = normalizedLanguage;
        document.documentElement.dir = 'ltr';

        if (!translationCache[normalizedLanguage]) {
            const assetUrl = getLanguageAssetUrl(normalizedLanguage);
            const response = await fetch(assetUrl);
            if (!response.ok) {
                throw new Error(`Failed to load ${assetUrl}: ${response.status}`);
            }

            translationCache[normalizedLanguage] = await response.json();
        }

        activeLanguage = normalizedLanguage;
        applyLanguage(normalizedLanguage);
    } catch (error) {
        console.warn(`Localization asset unavailable for ${normalizedLanguage}; using HTML fallback text.`, error);

        if (normalizedLanguage !== 'en') {
            return loadLanguage('en');
        }
    }
}

function handleLanguageMenuClick(event) {
    const link = event.currentTarget;
    const selectedLanguage = normalizeLanguageCode(link.getAttribute('data-lang'));

    event.preventDefault();
    loadLanguage(selectedLanguage);
    closeLanguageDropdown();
}

let languageDropdownController = null;

function closeLanguageDropdown() {
    if (!languageDropdownController) {
        return;
    }

    languageDropdownController.close();
}

function initLanguageDropdownController() {
    const dropdown = document.getElementById('language-dropdown');
    const trigger = document.getElementById('language-dropdown-trigger');
    const menu = dropdown ? dropdown.querySelector('.dropdown-content') : null;

    if (!dropdown || !trigger || !menu) {
        return;
    }

    const isTouchLike = window.matchMedia('(hover: none)').matches ||
        window.matchMedia('(pointer: coarse)').matches ||
        navigator.maxTouchPoints > 0;

    const setExpanded = expanded => {
        trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        dropdown.classList.toggle('dropdown-open', expanded);
    };

    const close = () => {
        setExpanded(false);
    };

    languageDropdownController = { close };

    if (isTouchLike) {
        dropdown.classList.remove('dropdown-hover');

        trigger.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            setExpanded(!dropdown.classList.contains('dropdown-open'));
        });

        document.addEventListener('pointerdown', event => {
            if (!dropdown.contains(event.target)) {
                close();
            }
        }, true);

        document.addEventListener('touchstart', event => {
            if (!dropdown.contains(event.target)) {
                close();
            }
        }, true);

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                close();
            }
        });

        window.addEventListener('blur', close);
        window.addEventListener('pagehide', close);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            close();
        }
    });

    menu.addEventListener('click', event => {
        if (event.target.closest('[data-lang]')) {
            window.setTimeout(close, 0);
        }
    });
}

function applyBasicProfileData(profileData) {
    if (!profileData?.profile) {
        return;
    }

    const asiaServer = profileData.profile.asiaServer;
    const chinaServer = profileData.profile.chinaServer;

    const asiaIgnElement = document.getElementById('asia-server-ign');
    const asiaIdElement = document.getElementById('asia-server-id');
    const asiaCopyButton = document.getElementById('asia-server-copy');
    const chinaIgnElement = document.getElementById('china-server-ign');
    const chinaIdElement = document.getElementById('china-server-id');
    const chinaCopyButton = document.getElementById('china-server-copy');

    if (asiaIgnElement && typeof asiaServer?.ign === 'string') {
        asiaIgnElement.textContent = asiaServer.ign;
    }
    if (asiaIdElement && typeof asiaServer?.id === 'string') {
        asiaIdElement.textContent = asiaServer.id;
    }
    if (asiaCopyButton && typeof asiaServer?.id === 'string') {
        asiaCopyButton.setAttribute('data-copy-id', asiaServer.id);
    }

    if (chinaIgnElement && typeof chinaServer?.ign === 'string') {
        chinaIgnElement.textContent = chinaServer.ign;
    }
    if (chinaIdElement && typeof chinaServer?.id === 'string') {
        chinaIdElement.textContent = chinaServer.id;
    }
    if (chinaCopyButton && typeof chinaServer?.id === 'string') {
        chinaCopyButton.setAttribute('data-copy-id', chinaServer.id);
    }
}

async function loadBasicProfileData() {
    try {
        if (!basicProfileDataCache) {
            const response = await fetch(BASIC_PROFILE_DATA_URL);

            if (!response.ok) {
                throw new Error(`Failed to load ${BASIC_PROFILE_DATA_URL}: ${response.status}`);
            }

            basicProfileDataCache = await response.json();
        }

        applyBasicProfileData(basicProfileDataCache);
    } catch (error) {
        console.warn('Basic profile data unavailable; keeping the HTML fallback values.', error);
    }
}
let AUTO_DETECT_DEV_MODE = true; // Set to false to disable auto-detection of developer mode

// Drawer close on internal link click
document.addEventListener('DOMContentLoaded', () => {
    initThemeController();
    initLanguageDropdownController();
    loadLanguage('auto');
    loadBasicProfileData();
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-lang]').forEach(link => {
        link.addEventListener('click', handleLanguageMenuClick);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const drawerLinks = document.querySelectorAll('.drawer-side .menu a');
    const drawerToggle = document.getElementById('my-drawer');
    if (drawerToggle && drawerLinks.length > 0) {
        drawerLinks.forEach(link => {
            if (link.getAttribute('href').startsWith('#') || link.getAttribute('href') === '/') {
                link.addEventListener('click', () => {
                    drawerToggle.checked = false;
                });
            }
        });
    }
});

window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// Initialize GLightbox
document.addEventListener('DOMContentLoaded', () => {
    const lightbox = GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: false,
        autoplayVideos: false
    });
});

// Copy ID functionality with tooltip and first-time alert
document.addEventListener('DOMContentLoaded', () => {
    const copyBtns = document.querySelectorAll('.copy-id-btn');
    const firstCopyAlert = document.getElementById('first_copy_alert');
    let hasShownAlert = false;

    const executeCopy = async (btn) => {
        const textToCopy = btn.getAttribute('data-copy-id');
        const tooltipWrapper = btn.closest('.tooltip');
        if (!textToCopy) return;

        try {
            await navigator.clipboard.writeText(textToCopy);
            let originalTip = '';
            
            if (tooltipWrapper) {
                originalTip = tooltipWrapper.getAttribute('data-tip');
                tooltipWrapper.setAttribute('data-tip', 'Copied!');
            }
            
            setTimeout(() => {
                if (tooltipWrapper) {
                    tooltipWrapper.setAttribute('data-tip', originalTip);
                }
            }, 1500);
        } catch (err) {
            console.error('Failed to copy text', err);
        }
    };

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Always copy immediately
            executeCopy(btn);

            // Show alert first time
            if (!hasShownAlert && firstCopyAlert) {
                const toastContainer = document.getElementById('toast_container');
                if (toastContainer) toastContainer.style.display = 'block';

                firstCopyAlert.classList.remove('-translate-y-10', 'opacity-0');
                firstCopyAlert.classList.add('translate-y-0', 'opacity-100');
                hasShownAlert = true;
                
                // Hide automatically after 8 seconds
                setTimeout(() => {
                    firstCopyAlert.classList.remove('translate-y-0', 'opacity-100');
                    firstCopyAlert.classList.add('-translate-y-10', 'opacity-0');
                    setTimeout(() => {
                        if (toastContainer) toastContainer.style.display = 'none';
                    }, 500); // Wait for transition
                }, 8000);
            }
        });
    });
});

// Contact Form Listener
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Form submission logic to be implemented
        });
    }
});

let loadMap = true;
let developerMode = false;
// Check origin to determine developer mode - If yes, disable google analytics
function autoDeveloperMode(enableAutoDetect) {
    if (!enableAutoDetect) {
        return false;
    }
    const devOrigins = [
        "localhost",
        "l.ujayden.com",
        "127.0.0.1"
    ];
    // Yes - Disable google analytics + map load
    if (devOrigins.includes(window.location.hostname)) {
        developerMode = true;
        loadMap = false;
        //Override loadMap:
        //loadMap = true;
        console.log("Developer mode automatically enabled for origin:", window.location.hostname);
        return true;
    }
    return false;
}
// Auto-detect developer mode on page load
autoDeveloperMode(AUTO_DETECT_DEV_MODE);
if (developerMode) {
    console.log("Developer mode is enabled. Google Analytics and certain features are disabled.");
}

let map;
let mapInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    const collapse = mapContainer?.closest('.collapse');
    const toggle = collapse?.querySelector('input[type="checkbox"]');

    if (!mapContainer || !loadMap) return;

    mapContainer.setAttribute('style', 'height: 400px; width: 100%; border-radius: 0.5rem; z-index: 0;');
    const mapLocation = [22.3040, 114.1790];

    function initMap() {
        if (mapInitialized) return;

        map = L.map('map').setView(mapLocation, 13);

        const topoBase = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/WGS84/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; <a href="https://api.portal.hkmapservice.gov.hk/disclaimer" target="_blank">Map from Lands Department</a>'
        });

        const topoLabels = L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/en/WGS84/{z}/{x}/{y}.png', {
            maxZoom: 20
        });

        topoBase.addTo(map);
        topoLabels.addTo(map);
        L.marker(mapLocation).addTo(map).openPopup();

        // Add Lands Department logo
        L.Control.LandsLogo = L.Control.extend({
            onAdd: function(map) {
                let img = L.DomUtil.create('img');
                img.src = '/libraries/leaflet/images/Lands_Department_logo.png';
                img.style.width = '24px';
                img.style.opacity = '0.6';
                img.style.cursor = 'pointer';
                img.title = 'Lands Department';
                img.onclick = function() {
                    window.open('https://api.portal.hkmapservice.gov.hk/disclaimer', '_blank');
                };
                return img;
            }
        });
        
        L.control.landsLogo = function(opts) {
            return new L.Control.LandsLogo(opts);
        }
        
        L.control.landsLogo({ position: 'bottomright' }).addTo(map);

        mapInitialized = true;
    }

    function refreshMap() {
        if (!mapInitialized) initMap();
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    }

    if (toggle) {
        if (toggle.checked) refreshMap();

        toggle.addEventListener('change', () => {
            if (toggle.checked) refreshMap();
        });
    } else {
        refreshMap();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if (!developerMode) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YCECGQET86');
    }
});
