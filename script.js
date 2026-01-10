// Citation Generator - Complete Solution
let currentStyle = 'apa';

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Citation Generator...');
    
    // Initialize all modules
    initializeMobileMenu();
    initializeTabs();
    initializeForm();
    initializeCitationGenerator();
    initializeAnalytics();
    checkURLParameters();
    
    // Set up service worker if available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
    
    console.log('Citation Generator initialized successfully!');
});

// ======================
// MOBILE MENU FUNCTIONS
// ======================
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    const body = document.body;
    
    if (!mobileMenuBtn || !mainNav) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    console.log('Initializing mobile menu...');
    
    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const isActive = mainNav.classList.contains('active');
        
        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (mainNav.classList.contains('active') && 
            !mainNav.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking links (optional delay for smooth transition)
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Add small delay for better UX
            setTimeout(closeMobileMenu, 100);
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
    
    console.log('Mobile menu initialized');
}

function openMobileMenu() {
    const mainNav = document.querySelector('.main-nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const body = document.body;
    
    if (!mainNav || !mobileMenuBtn) return;
    
    mainNav.classList.add('active');
    mobileMenuBtn.innerHTML = '✕';
    mobileMenuBtn.setAttribute('aria-label', 'Close menu');
    body.classList.add('menu-open');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    trackEvent('mobile_menu', 'open');
}

function closeMobileMenu() {
    const mainNav = document.querySelector('.main-nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const body = document.body;
    
    if (!mainNav || !mobileMenuBtn) return;
    
    mainNav.classList.remove('active');
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.setAttribute('aria-label', 'Open menu');
    body.classList.remove('menu-open');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    trackEvent('mobile_menu', 'close');
}

// ======================
// TAB FUNCTIONS
// ======================
function initializeTabs() {
    const tabs = document.querySelectorAll('.style-tab');
    
    if (!tabs.length) {
        console.warn('Style tabs not found');
        return;
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const style = this.dataset.style;
            if (style) {
                switchStyle(style);
            }
        });
    });
    
    // Check for saved preference
    const savedStyle = localStorage.getItem('preferredCitationStyle');
    if (savedStyle && ['apa', 'mla', 'chicago'].includes(savedStyle)) {
        switchStyle(savedStyle);
    }
}

function switchStyle(style) {
    if (!['apa', 'mla', 'chicago'].includes(style)) {
        console.error('Invalid style:', style);
        return;
    }
    
    console.log('Switching to style:', style);
    currentStyle = style;
    
    // Save preference
    localStorage.setItem('preferredCitationStyle', style);
    
    // Update active tab
    document.querySelectorAll('.style-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-style="${style}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update badge
    const badgeMap = {
        'apa': 'APA 7th',
        'mla': 'MLA 9th',
        'chicago': 'Chicago 17th'
    };
    const styleBadge = document.getElementById('styleBadge');
    if (styleBadge) {
        styleBadge.textContent = badgeMap[style] || 'APA 7th';
    }
    
    // Update style info
    const infoMap = {
        'apa': 'APA (American Psychological Association): Used in psychology, education, and social sciences.',
        'mla': 'MLA (Modern Language Association): Used in humanities, literature, and arts.',
        'chicago': 'Chicago Manual of Style: Used in publishing, history, and some social sciences.'
    };
    const styleInfo = document.getElementById('styleInfo');
    if (styleInfo) {
        styleInfo.innerHTML = `<p><strong>${badgeMap[style] || 'APA 7th'}:</strong> ${infoMap[style] || ''}</p>`;
    }
    
    // Update form fields
    updateFormForStyle(style);
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('style', style);
    window.history.replaceState({}, '', url);
    
    trackEvent('citation_style', 'switch', style);
    
    // Regenerate citation if form has data
    if (document.getElementById('author')?.value.trim()) {
        setTimeout(generateCitation, 100);
    }
}

function updateFormForStyle(style) {
    const dynamicFields = document.getElementById('dynamicFields');
    if (!dynamicFields) return;
    
    const templates = {
        'apa': `
            <div class="form-group">
                <label for="publisher">Publisher</label>
                <input type="text" id="publisher" placeholder="e.g., Oxford University Press">
            </div>
            <div class="form-group">
                <label for="journal">Journal Name (if applicable)</label>
                <input type="text" id="journal" placeholder="e.g., Journal of Psychology">
            </div>
        `,
        'mla': `
            <div class="form-group">
                <label for="publisher">Publisher</label>
                <input type="text" id="publisher" placeholder="e.g., Oxford University Press">
            </div>
            <div class="form-group">
                <label for="city">City of Publication</label>
                <input type="text" id="city" placeholder="e.g., New York">
            </div>
        `,
        'chicago': `
            <div class="form-group">
                <label for="publisher">Publisher</label>
                <input type="text" id="publisher" placeholder="e.g., University of Chicago Press">
            </div>
            <div class="form-group">
                <label for="edition">Edition (if applicable)</label>
                <input type="text" id="edition" placeholder="e.g., 3rd ed.">
            </div>
        `
    };
    
    dynamicFields.innerHTML = templates[style] || templates['apa'];
}

// ======================
// FORM FUNCTIONS
// ======================
function initializeForm() {
    // Form validation
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Enter key to generate citation
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
            e.preventDefault();
            generateCitation();
        }
    });
    
    // Auto-save form data
    setInterval(saveFormData, 5000);
    
    // Load saved form data
    loadFormData();
}

function validateField(field) {
    if (field.required && !field.value.trim()) {
        field.classList.add('invalid');
        showAlert(`Please fill in ${field.previousElementSibling?.textContent || 'this field'}`, 'error');
        return false;
    }
    field.classList.remove('invalid');
    return true;
}

function saveFormData() {
    try {
        const formData = {
            author: document.getElementById('author')?.value || '',
            year: document.getElementById('year')?.value || '',
            title: document.getElementById('title')?.value || '',
            publisher: document.getElementById('publisher')?.value || '',
            url: document.getElementById('url')?.value || '',
            style: currentStyle
        };
        localStorage.setItem('citationFormData', JSON.stringify(formData));
    } catch (e) {
        console.error('Failed to save form data:', e);
    }
}

function loadFormData() {
    try {
        const saved = localStorage.getItem('citationFormData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.style) switchStyle(data.style);
            
            // Wait for form to update, then fill data
            setTimeout(() => {
                if (data.author) document.getElementById('author').value = data.author;
                if (data.year) document.getElementById('year').value = data.year;
                if (data.title) document.getElementById('title').value = data.title;
                if (data.publisher) document.getElementById('publisher').value = data.publisher;
                if (data.url) document.getElementById('url').value = data.url;
            }, 100);
        }
    } catch (e) {
        console.error('Failed to load form data:', e);
    }
}

// ======================
// CITATION GENERATION
// ======================
function initializeCitationGenerator() {
    // Add event listeners for buttons if they exist
    const generateBtn = document.querySelector('.btn-primary');
    if (generateBtn && !generateBtn.onclick) {
        generateBtn.onclick = generateCitation;
    }
}

function generateCitation() {
    console.log('Generating citation for style:', currentStyle);
    
    // Get form values
    const author = document.getElementById('author')?.value.trim() || '';
    const year = document.getElementById('year')?.value.trim() || '';
    const title = document.getElementById('title')?.value.trim() || '';
    const publisher = document.getElementById('publisher')?.value.trim() || '';
    const url = document.getElementById('url')?.value.trim() || '';
    const sourceType = document.getElementById('sourceType')?.value || 'book';
    
    // Validation
    if (!author || !year || !title) {
        showAlert('Please fill in all required fields (Author, Year, Title)', 'error');
        return;
    }
    
    if (year && (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1)) {
        showAlert('Please enter a valid publication year (1000-' + (new Date().getFullYear() + 1) + ')', 'error');
        return;
    }
    
    // Generate citation based on style
    let citation = '';
    try {
        switch(currentStyle) {
            case 'apa':
                citation = generateAPACitation(author, year, title, publisher, url, sourceType);
                break;
            case 'mla':
                citation = generateMLACitation(author, year, title, publisher, url, sourceType);
                break;
            case 'chicago':
                citation = generateChicagoCitation(author, year, title, publisher, url, sourceType);
                break;
            default:
                citation = generateAPACitation(author, year, title, publisher, url, sourceType);
        }
        
        // Display result
        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.innerHTML = `<pre>${citation}</pre>`;
        }
        
        // Save to history
        saveCitationToHistory(citation);
        
        // Show success message
        showAlert('Citation generated successfully!', 'success');
        
        // Track generation
        trackEvent('citation', 'generate', currentStyle);
        
    } catch (error) {
        console.error('Citation generation error:', error);
        showAlert('Error generating citation. Please check your input.', 'error');
    }
}

function generateAPACitation(author, year, title, publisher, url, sourceType) {
    // Format authors
    const authors = formatAuthors(author, 'apa');
    
    // Build citation
    let citation = '';
    
    switch(sourceType) {
        case 'journal':
            const journal = document.getElementById('journal')?.value.trim() || 'Journal Name';
            citation = `${authors} (${year}). ${title}. ${journal}.`;
            if (url) citation += ` ${url}`;
            break;
            
        case 'website':
            citation = `${authors} (${year}, ${getCurrentMonth()}). ${title}.`;
            if (publisher) citation += ` ${publisher}.`;
            if (url) citation += ` Retrieved from ${url}`;
            else citation += '.';
            break;
            
        default: // book
            citation = `${authors} (${year}). ${title}.`;
            if (publisher) citation += ` ${publisher}.`;
            if (url) citation += ` ${url}`;
    }
    
    return citation;
}

function generateMLACitation(author, year, title, publisher, url, sourceType) {
    // Format authors
    const authors = formatAuthors(author, 'mla');
    const city = document.getElementById('city')?.value.trim() || '';
    
    // Build citation
    let citation = '';
    
    switch(sourceType) {
        case 'journal':
            citation = `${authors}. "${title}." Journal Name, ${year}.`;
            break;
            
        case 'website':
            citation = `${authors}. "${title}." Website Name, ${publisher}, ${year}.`;
            if (url) citation += ` ${url}.`;
            break;
            
        default: // book
            citation = `${authors}. ${title}.`;
            if (publisher) citation += ` ${publisher},`;
            if (city) citation += ` ${city},`;
            citation += ` ${year}.`;
    }
    
    return citation;
}

function generateChicagoCitation(author, year, title, publisher, url, sourceType) {
    // Format authors
    const authors = formatAuthors(author, 'chicago');
    const edition = document.getElementById('edition')?.value.trim() || '';
    
    // Build citation
    let citation = '';
    const editionText = edition ? ` ${edition}` : '';
    
    switch(sourceType) {
        case 'journal':
            citation = `${authors}. "${title}." Journal Name (${year}).`;
            break;
            
        case 'website':
            citation = `${authors}. "${title}." ${publisher}. Accessed ${getFormattedDate()}.`;
            if (url) citation += ` ${url}`;
            break;
            
        default: // book
            citation = `${authors}. ${title}.${editionText} ${publisher}, ${year}.`;
    }
    
    return citation;
}

function formatAuthors(authorString, style) {
    if (!authorString.trim()) return '';
    
    return authorString.split(';').map(author => {
        const parts = author.split(',').map(p => p.trim());
        
        if (parts.length === 2) {
            const [last, first] = parts;
            switch(style) {
                case 'apa':
                    return `${last}, ${first.charAt(0)}.`;
                case 'mla':
                    return `${last}, ${first}`;
                case 'chicago':
                    return `${first} ${last}`;
                default:
                    return `${last}, ${first}`;
            }
        }
        return author.trim();
    }).join(', ');
}

// ======================
// EXAMPLE & UTILITY FUNCTIONS
// ======================
function fillExample() {
    const examples = {
        apa: {
            author: 'Smith, John; Johnson, Mary',
            year: '2023',
            title: 'The Psychology of Modern Learning',
            publisher: 'Academic Press',
            journal: 'Journal of Psychology'
        },
        mla: {
            author: 'Smith, John; Johnson, Mary',
            year: '2023',
            title: 'Modern Literary Criticism',
            publisher: 'Penguin Books',
            city: 'New York'
        },
        chicago: {
            author: 'Smith, John; Johnson, Mary',
            year: '2023',
            title: 'Historical Perspectives',
            publisher: 'University of Chicago Press',
            edition: '2nd ed.'
        }
    };
    
    const example = examples[currentStyle] || examples.apa;
    
    document.getElementById('author').value = example.author;
    document.getElementById('year').value = example.year;
    document.getElementById('title').value = example.title;
    document.getElementById('publisher').value = example.publisher;
    
    // Fill additional fields based on style
    if (currentStyle === 'apa') {
        const journalField = document.getElementById('journal');
        if (journalField) journalField.value = example.journal;
    } else if (currentStyle === 'mla') {
        const cityField = document.getElementById('city');
        if (cityField) cityField.value = example.city;
    } else if (currentStyle === 'chicago') {
        const editionField = document.getElementById('edition');
        if (editionField) editionField.value = example.edition;
    }
    
    trackEvent('example', 'load', currentStyle);
    
    // Auto-generate after a delay
    setTimeout(generateCitation, 300);
}

function clearForm() {
    // Clear all inputs
    document.querySelectorAll('.input-card input, .input-card select, .input-card textarea').forEach(input => {
        input.value = '';
    });
    
    // Reset result
    const result = document.getElementById('result');
    if (result) {
        result.innerHTML = `
            <div class="result-placeholder">
                <div class="placeholder-icon">📄</div>
                <p>Select a style and fill the form to generate citation</p>
            </div>`;
    }
    
    // Clear saved form data
    localStorage.removeItem('citationFormData');
    
    showAlert('Form cleared', 'info');
    trackEvent('form', 'clear');
}

function copyCitation() {
    const result = document.getElementById('result');
    if (!result) return;
    
    const text = result.textContent;
    if (!text || text.includes('Select a style')) {
        showAlert('No citation to copy. Please generate a citation first.', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.classList.remove('copied');
            }, 2000);
        }
        
        showAlert('Citation copied to clipboard!', 'success');
        trackEvent('citation', 'copy');
        
    }).catch(err => {
        console.error('Failed to copy:', err);
        showAlert('Failed to copy. Please try again.', 'error');
    });
}

function downloadCitation() {
    const result = document.getElementById('result');
    if (!result) return;
    
    const text = result.textContent;
    if (!text || text.includes('Select a style')) {
        showAlert('No citation to download. Please generate a citation first.', 'warning');
        return;
    }
    
    try {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `citation_${currentStyle}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('Citation downloaded successfully!', 'success');
        trackEvent('citation', 'download');
        
    } catch (error) {
        console.error('Download error:', error);
        showAlert('Failed to download citation.', 'error');
    }
}

// ======================
// ANALYTICS FUNCTIONS
// ======================
function initializeAnalytics() {
    // Track page view
    trackPageView();
    
    // Track interactions
    trackInteractions();
    
    // Track errors
    window.addEventListener('error', function(e) {
        trackEvent('error', 'javascript', e.message, 1);
    });
    
    // Track performance
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            trackEvent('performance', 'page_load', loadTime.toString(), 1);
        });
    }
}

function trackPageView() {
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
}

function trackEvent(category, action, label = null, value = null) {
    if (typeof gtag === 'function') {
        const eventParams = {
            event_category: category,
            event_label: label || action,
            value: value || 1
        };
        
        // Clean up parameters
        Object.keys(eventParams).forEach(key => {
            if (eventParams[key] === null || eventParams[key] === undefined) {
                delete eventParams[key];
            }
        });
        
        gtag('event', action, eventParams);
    }
    
    // Also log to console for debugging
    console.log(`[Analytics] ${category}.${action}`, label ? `Label: ${label}` : '', value ? `Value: ${value}` : '');
}

function trackInteractions() {
    // Track button clicks
    document.querySelectorAll('.btn, .style-tab, .mobile-menu-btn').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.textContent.trim() || this.getAttribute('aria-label') || 'button';
            trackEvent('ui', 'click', text);
        });
    });
    
    // Track form field interactions
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('focus', function() {
            trackEvent('form', 'focus', this.name || this.id);
        });
    });
}

// ======================
// HELPER FUNCTIONS
// ======================
function saveCitationToHistory(citation) {
    try {
        const history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
        
        history.unshift({
            citation,
            style: currentStyle,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history.length = 50;
        }
        
        localStorage.setItem('citationHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save citation history:', e);
    }
}

function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `custom-alert custom-alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 9999;
                max-width: 300px;
                animation: slideInRight 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .custom-alert-info {
                background: #3498db;
                color: white;
                border-left: 4px solid #2980b9;
            }
            .custom-alert-success {
                background: #2ecc71;
                color: white;
                border-left: 4px solid #27ae60;
            }
            .custom-alert-warning {
                background: #f39c12;
                color: white;
                border-left: 4px solid #d35400;
            }
            .custom-alert-error {
                background: #e74c3c;
                color: white;
                border-left: 4px solid #c0392b;
            }
            .alert-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                margin-left: 15px;
                opacity: 0.8;
            }
            .alert-close:hover {
                opacity: 1;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

function getCurrentMonth() {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[new Date().getMonth()];
}

function getFormattedDate() {
    const now = new Date();
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return now.toLocaleDateString('en-US', options);
}

function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const style = urlParams.get('style');
    
    if (style && ['apa', 'mla', 'chicago'].includes(style)) {
        switchStyle(style);
    }
}

// ======================
// EXPORT FUNCTIONS FOR HTML
// ======================
// Make functions available globally for onclick attributes
window.generateCitation = generateCitation;
window.fillExample = fillExample;
window.clearForm = clearForm;
window.copyCitation = copyCitation;
window.downloadCitation = downloadCitation;

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateCitation();
    }
    
    // Ctrl/Cmd + E for example
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        fillExample();
    }
    
    // Ctrl/Cmd + C to copy (only when not in input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        copyCitation();
    }
});

// Add CSS for invalid fields
if (!document.querySelector('#form-styles')) {
    const style = document.createElement('style');
    style.id = 'form-styles';
    style.textContent = `
        .invalid {
            border-color: #e74c3c !important;
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1) !important;
        }
        .copied {
            background-color: #27ae60 !important;
        }
    `;
    document.head.appendChild(style);
}

console.log('Citation Generator script loaded successfully');
