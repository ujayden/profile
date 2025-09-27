// Language switching functionality
let currentLanguage = 'en';
let translations = {};
let siteData = {};

// Detect browser language and set default
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.languages[0];
    
    // Check if browser language is Chinese (any variant)
    const chineseLanguages = [
        'zh', 'zh-CN', 'zh-TW', 'zh-HK', 'zh-MO', 'zh-SG',
        'cmn', 'yue', 'nan'
    ];
    
    // Check if browser language starts with any Chinese language code
    const isChineseLanguage = chineseLanguages.some(lang => 
        browserLang.toLowerCase().startsWith(lang.toLowerCase())
    );
    
    return isChineseLanguage ? 'tc' : 'en';
}

// Load language files and data
async function loadLanguages() {
    try {
        // Set default language based on browser detection
        currentLanguage = detectBrowserLanguage();
        
        const [enResponse, tcResponse, dataResponse] = await Promise.all([
            fetch('idv_language_en.json'),
            fetch('idv_language_tc.json'),
            fetch('idv_data.json')
        ]);
        
        translations.en = await enResponse.json();
        translations.tc = await tcResponse.json();
        siteData = await dataResponse.json();
        
        // Apply detected language and populate data
        applyLanguage(currentLanguage);
        populateData();
    } catch (error) {
        console.error('Error loading language files or data:', error);
    }
}

// Apply language to all elements with data-i18n attribute
function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Keys that may contain safe inline HTML (e.g., <s>)
            const htmlAllowedKeys = new Set(['about_me_intro']);

            // Handle character description specially to preserve line breaks
            if (key === 'character_description') {
                element.innerHTML = translations[lang][key].replace(/\n/g, '<br>');
            } else if (htmlAllowedKeys.has(key)) {
                element.innerHTML = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
                // Ensure browser tab title updates as well
                if (key === 'page_title' || element.tagName?.toLowerCase() === 'title') {
                    document.title = translations[lang][key];
                }
            }
        }
    });
    currentLanguage = lang;
    
    // Update active language button
    updateLanguageButtons();
}

// Populate data from idv_data.json
function populateData() {
    if (!siteData) return;
    
    // Update profile information
    if (siteData.profile) {
        // Main name (already hardcoded in HTML, but can be updated if needed)
        
        // Asia Server - target the first server section with blue colors
        const asiaSection = document.querySelector('#profile .space-y-4 > div:first-of-type');
        if (asiaSection) {
            const asiaIgnElement = asiaSection.querySelector('p:first-child span:last-child');
            const asiaIdElement = asiaSection.querySelector('p:last-child span.font-mono');
            const asiaIdButton = asiaSection.querySelector('button[data-id]');
            
            if (asiaIgnElement) asiaIgnElement.textContent = siteData.profile.asiaServer.ign;
            if (asiaIdElement) asiaIdElement.textContent = siteData.profile.asiaServer.id;
            if (asiaIdButton) asiaIdButton.setAttribute('data-id', siteData.profile.asiaServer.id);
        }
        
        // China Server - target the second server section with red colors
        const chinaSection = document.querySelector('#profile .space-y-4 > div:last-of-type');
        if (chinaSection) {
            const chinaIgnElement = chinaSection.querySelector('p:first-child span:last-child');
            const chinaIdElement = chinaSection.querySelector('p:last-child span.font-mono');
            const chinaIdButton = chinaSection.querySelector('button[data-id]');
            
            if (chinaIgnElement) chinaIgnElement.textContent = siteData.profile.chinaServer.ign;
            if (chinaIdElement) chinaIdElement.textContent = siteData.profile.chinaServer.id;
            if (chinaIdButton) chinaIdButton.setAttribute('data-id', siteData.profile.chinaServer.id);
        }
    }
    
    // Update statistics
    if (siteData.statistics) {
        const lastUpdatedElement = document.querySelector('[data-i18n="last_updated"]');
        if (lastUpdatedElement && currentLanguage === 'en') {
            lastUpdatedElement.textContent = `Last updated: ${siteData.statistics.lastUpdated}`;
        } else if (lastUpdatedElement && currentLanguage === 'tc') {
            lastUpdatedElement.textContent = `最後更新：${siteData.statistics.lastUpdated}`;
        }
        
        // Update tier icons
        const survivorIconElement = document.getElementById('survivor-tier-icon');
        const hunterIconElement = document.getElementById('hunter-tier-icon');
        const historicalSurvivorIconElement = document.getElementById('historical-survivor-tier-icon');
        const historicalHunterIconElement = document.getElementById('historical-hunter-tier-icon');
        
        if (survivorIconElement && siteData.statistics.survivor.tierIconURL) {
            survivorIconElement.src = siteData.statistics.survivor.tierIconURL;
        }
        if (hunterIconElement && siteData.statistics.hunter.tierIconURL) {
            hunterIconElement.src = siteData.statistics.hunter.tierIconURL;
        }

        // Update historical stats
        if (siteData.statistics.historical) {
            const historicalSurvivorTierElement = document.querySelector('[data-i18n="historical_survivor_tier"]');
            const historicalHunterTierElement = document.querySelector('[data-i18n="historical_hunter_tier"]');

            // Only overwrite text if translation key is missing for current language
            if (historicalSurvivorTierElement) {
                const hasTranslation = !!translations[currentLanguage]?.historical_survivor_tier;
                if (!hasTranslation) {
                    historicalSurvivorTierElement.textContent = siteData.statistics.historical.survivor.tier;
                }
            }
            if (historicalHunterTierElement) {
                const hasTranslation = !!translations[currentLanguage]?.historical_hunter_tier;
                if (!hasTranslation) {
                    historicalHunterTierElement.textContent = siteData.statistics.historical.hunter.tier;
                }
            }
            if (historicalSurvivorIconElement && siteData.statistics.historical.survivor.tierIconURL) {
                historicalSurvivorIconElement.src = siteData.statistics.historical.survivor.tierIconURL;
            }
            if (historicalHunterIconElement && siteData.statistics.historical.hunter.tierIconURL) {
                historicalHunterIconElement.src = siteData.statistics.historical.hunter.tierIconURL;
            }
        }
    }
    
    // Update character knowledge points
    if (siteData.characterKnowledge) {
        const tableBody = document.querySelector('#character-knowledge tbody');
        const row = tableBody.querySelector('tr');
        
        const highestBadgeCell = row.cells[0].querySelector('img');
        const highestPointsCell = row.cells[0].querySelector('span');
        const characterNameCell = row.cells[1];
        const currentBadgeCell = row.cells[2].querySelector('img');

        if (highestBadgeCell) highestBadgeCell.src = siteData.characterKnowledge.highest.badge;
        if (highestPointsCell) highestPointsCell.textContent = `(${siteData.characterKnowledge.highest.points})`;
        if (characterNameCell) {
            // Prefer translation if available; otherwise fallback to data
            if (translations[currentLanguage]?.fire_investigator_label) {
                characterNameCell.textContent = translations[currentLanguage].fire_investigator_label;
            } else {
                characterNameCell.textContent = siteData.characterKnowledge.characterName;
            }
        }
        if (currentBadgeCell) currentBadgeCell.src = siteData.characterKnowledge.current.badge;
    }

    // Update favourite character
    if (siteData.favouriteCharacter) {
        const characterNameElement = document.querySelector('[data-i18n="character_name"]');
        const characterDescElement = document.querySelector('[data-i18n="character_description"]');
        const characterImageElement = document.querySelector('#favourite-character img');
        
        if (characterNameElement && !translations[currentLanguage]?.character_name) {
            characterNameElement.textContent = siteData.favouriteCharacter.name;
        }
        if (characterDescElement && !translations[currentLanguage]?.character_description) {
            characterDescElement.innerHTML = siteData.favouriteCharacter.description.replace(/\n/g, '<br>');
        }
        if (characterImageElement) {
            characterImageElement.src = siteData.favouriteCharacter.image;
        }
    }
    
    // Update links
    if (siteData.links) {
        const blogLink = document.querySelector('a[href*="ujayden.com"]:not([href*="privacy"])');
        const githubLink = document.querySelector('a[href*="github.com"]');
        const threadsLink = document.querySelector('a[href*="threads.com"]');
        const mailLink = document.querySelector('a[href^="mailto:"]');
        const privacyLink = document.querySelector('a[href*="privacy"]');
        
        if (blogLink) blogLink.href = siteData.links.blog;
        if (githubLink) githubLink.href = siteData.links.github;
        if (threadsLink) threadsLink.href = siteData.links.threads;
        if (mailLink) mailLink.href = siteData.links.mail;
        if (privacyLink) privacyLink.href = siteData.links.privacy;
    }
    
    // Log version info
    console.log(`Site data loaded - Version: ${siteData.version}, Last Update: ${siteData.lastUpdate}`);
}

// Update language button styles
function updateLanguageButtons() {
    const enBtn = document.getElementById('lang-en');
    const tcBtn = document.getElementById('lang-tc');
    
    // Reset styles
    enBtn.classList.remove('bg-white/40');
    tcBtn.classList.remove('bg-white/40');
    
    // Add active style
    if (currentLanguage === 'en') {
        enBtn.classList.add('bg-white/40');
    } else {
        tcBtn.classList.add('bg-white/40');
    }
}

// Copy ID to clipboard functionality
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

// Show copy feedback
function showCopyFeedback(button, success) {
    const originalText = button.textContent;
    
    if (success) {
        button.textContent = '✓';
        button.classList.add('bg-green-500/40');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-green-500/40');
        }, 1500);
    } else {
        button.textContent = '✗';
        button.classList.add('bg-red-500/40');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('bg-red-500/40');
        }, 1500);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load languages and data
    loadLanguages();
    
    // Language switcher event listeners
    document.getElementById('lang-en').addEventListener('click', () => {
        applyLanguage('en');
        populateData(); // Re-populate data for language-specific content
    });
    
    document.getElementById('lang-tc').addEventListener('click', () => {
        applyLanguage('tc');
        populateData(); // Re-populate data for language-specific content
    });
    
    // Copy ID button event listeners
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('copy-id-btn')) {
            const id = e.target.getAttribute('data-id');
            const success = await copyToClipboard(id);
            showCopyFeedback(e.target, success);
        }
    });
    
    // Initialize language buttons
    updateLanguageButtons();
});

console.warn("I see you opened the console. What are you looking for?");