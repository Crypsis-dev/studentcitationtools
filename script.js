// Citation Generator - Enhanced Mobile Support
let currentStyle = 'apa';

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMobileMenu();
    initializeTabs();
    initializeFormEvents();
    initializeAnalytics();
    checkURLParameters();
    setupServiceWorker();
});

// Mobile Menu Functions
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (!mobileMenuBtn || !mainNav) return;
    
    // Toggle menu
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!mainNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            closeMobileMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking links
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    if (!mainNav || !mobileMenuBtn) return;
    
    const isActive = mainNav.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const body = document.body;
    
    if (!mainNav || !mobileMenuBtn) return;
    
    mainNav.classList.add('active');
    mobileMenuBtn.textContent = '✕';
    mobileMenuBtn.setAttribute('aria-label', 'Close menu');
    body.classList.add('menu-open');
    
    // Track menu open
    trackEvent('menu', 'open');
}

function closeMobileMenu() {
    const mainNav = document.getElementById('mainNav');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const body = document.body;
    
    if (!mainNav || !mobileMenuBtn) return;
    
    mainNav.classList.remove('active');
    mobileMenuBtn.textContent = '☰';
    mobileMenuBtn.setAttribute('aria-label', 'Open menu');
    body.classList.remove('menu-open');
}

// Tab Functions
function initializeTabs() {
    const tabs = document.querySelectorAll('.style-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const style = this.dataset.style;
            switchStyle(style);
        });
    });
}

function switchStyle(style) {
    if (!['apa', 'mla', 'chicago'].includes(style)) return;
    
    currentStyle = style;
    
    // Update active tab
    document.querySelectorAll('.style-tab').forEach(t => {
        t.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`[data-style="${style}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Update badge
    const badgeText = style === 'apa' ? 'APA 7th' : 
                     style === 'mla' ? 'MLA 9th' : 'Chicago 17th';
    const styleBadge = document.getElementById('styleBadge');
    if (styleBadge) {
        styleBadge.textContent = badgeText;
    }
    
    // Update info
    const infoText = {
        apa: 'APA (American Psychological Association): Used in psychology, education, and social sciences.',
        mla: 'MLA (Modern Language Association): Used in humanities, literature, and arts.',
        chicago: 'Chicago Manual of Style: Used in publishing, history, and some social sciences.'
    };
    
    const styleInfo = document.getElementById('styleInfo');
    if (styleInfo) {
        styleInfo.innerHTML = `<p><strong>${badgeText}:</strong> ${infoText[style]}</p>`;
    }
    
    // Update form
    updateFormForStyle(style);
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('style', style);
    window.history.replaceState({}, '', url);
    
    // Track style change
    trackEvent('style_change', style);
}

function updateFormForStyle(style) {
    const dynamicFields = document.getElementById('dynamicFields');
    if (!dynamicFields) return;
    
    switch(style) {
        case 'apa':
            dynamicFields.innerHTML = `
                <div class="form-group">
                    <label for="publisher">Publisher</label>
                    <input type="text" id="publisher" placeholder="e.g., Oxford University Press">
                </div>
                <div class="form-group">
                    <label for="journal">Journal Name (if applicable)</label>
                    <input type="text" id="journal" placeholder="e.g., Journal of Psychology">
                </div>
            `;
            break;
        case 'mla':
            dynamicFields.innerHTML = `
                <div class="form-group">
                    <label for="publisher">Publisher</label>
                    <input type="text" id="publisher" placeholder="e.g., Oxford University Press">
                </div>
                <div class="form-group">
                    <label for="city">City of Publication</label>
                    <input type="text" id="city" placeholder="e.g., New York">
                </div>
            `;
            break;
        case 'chicago':
            dynamicFields.innerHTML = `
                <div class="form-group">
                    <label for="publisher">Publisher</label>
                    <input type="text" id="publisher" placeholder="e.g., University of Chicago Press">
                </div>
                <div class="form-group">
                    <label for="edition">Edition (if applicable)</label>
                    <input type="text" id="edition" placeholder="e.g., 3rd ed.">
                </div>
            `;
            break;
    }
}

// Form Functions
function initializeFormEvents() {
    // Add input validation
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
    });
    
    // Enter key submits form
    const formInputs = document.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                generateCitation();
            }
        });
    });
}

function validateInput(e) {
    const input = e.target;
    if (input.required && !input.value.trim()) {
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
}

// Citation Generation
function generateCitation() {
    const author = document.getElementById('author')?.value.trim() || '';
    const year = document.getElementById('year')?.value.trim() || '';
    const title = document.getElementById('title')?.value.trim() || '';
    
    // Validate required fields
    if (!author || !year || !title) {
        showAlert('Please fill in all required fields (*)', 'error');
        return;
    }
    
    // Generate citation based on style
    let citation = '';
    const publisher = document.getElementById('publisher')?.value.trim() || '';
    const url = document.getElementById('url')?.value.trim() || '';
    
    switch(currentStyle) {
        case 'apa':
            citation = formatAPACitation(author, year, title, publisher, url);
            break;
        case 'mla':
            citation = formatMLACitation(author, year, title, publisher, url);
            break;
        case 'chicago':
            citation = formatChicagoCitation(author, year, title, publisher, url);
            break;
    }
    
    // Display result
    const resultElement = document.getElementById('result');
    if (resultElement) {
        resultElement.innerHTML = `<pre>${citation}</pre>`;
    }
    
    // Save to history
    saveToHistory(citation);
    
    // Track generation
    trackEvent('citation_generated', currentStyle);
}

function formatAPACitation(author, year, title, publisher, url) {
    const authors = formatAuthorsAPA(author);
    let citation = `${authors} (${year}). ${title}.`;
    if (publisher) citation += ` ${publisher}.`;
    if (url) citation += ` ${url}`;
    return citation;
}

function formatMLACitation(author, year, title, publisher, url) {
    const authors = formatAuthorsMLA(author);
    let citation = `${authors} "${title}."`;
    if (publisher) citation += ` ${publisher},`;
    citation += ` ${year}.`;
    if (url) citation += ` ${url}`;
    return citation;
}

function formatChicagoCitation(author, year, title, publisher, url) {
    const authors = formatAuthorsChicago(author);
    let citation = `${authors}. ${title}.`;
    if (publisher) citation += ` ${publisher},`;
    citation += ` ${year}.`;
    if (url) citation += ` ${url}`;
    return citation;
}

function formatAuthorsAPA(authorString) {
    return authorString.split(';').map(author => {
        const parts = author.split(',');
        if (parts.length === 2) {
            const [last, first] = parts.map(p => p.trim());
            return `${last}, ${first.charAt(0)}.`;
        }
        return author.trim();
    }).join(', ');
}

function formatAuthorsMLA(authorString) {
    return authorString.split(';').map(author => {
        const parts = author.split(',');
        if (parts.length === 2) {
            const [last, first] = parts.map(p => p.trim());
            return `${last}, ${first}`;
        }
        return author.trim();
    }).join(', ');
}

function formatAuthorsChicago(authorString) {
    return authorString.split(';').map(author => {
        const parts = author.split(',');
        if (parts.length === 2) {
            const [last, first] = parts.map(p => p.trim());
            return `${first} ${last}`;
        }
        return author.trim();
    }).join(', ');
}

// Utility Functions
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
    
    const example = examples[currentStyle];
    if (!example) return;
    
    document.getElementById('author').value = example.author;
    document.getElementById('year').value = example.year;
    document.getElementById('title').value = example.title;
    document.getElementById('publisher').value = example.publisher;
    
    // Track example load
    trackEvent('example_loaded', currentStyle);
}

function clearForm() {
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('title').value = '';
    document.getElementById('publisher').value = '';
    document.getElementById('url').value = '';
    
    const result = document.getElementById('result');
    if (result) {
        result.innerHTML = `
            <div class="result-placeholder">
                <div class="placeholder-icon">📄</div>
                <p>Select a style and fill the form to generate citation</p>
            </div>`;
    }
}

function copyCitation() {
    const result = document.getElementById('result');
    if (!result) return;
    
    const text = result.textContent;
    if (!text || text.includes('Select a style')) return;
    
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = original;
            }, 2000);
        }
        
        // Track copy
        trackEvent('citation_copied', currentStyle);
    });
}

function downloadCitation() {
    const result = document.getElementById('result');
    if (!result) return;
    
    const text = result.textContent;
    if (!text || text.includes('Select a style')) return;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citation_${currentStyle}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Track download
    trackEvent('citation_downloaded', currentStyle);
}

// Analytics Functions
function initializeAnalytics() {
    // Track page view
    trackPageView();
    
    // Track user interactions
    trackUserInteractions();
    
    // Track form submissions
    trackFormSubmissions();
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
        const eventData = {
            event_category: category,
            event_label: label || action,
            value: value || 1
        };
        
        gtag('event', action, eventData);
    }
}

function trackUserInteractions() {
    // Track clicks on external links
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('external_link', 'click', this.href);
        });
    });
    
    // Track form interactions
    document.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('focus', function() {
            trackEvent('form_field', 'focus', this.id || this.name);
        });
    });
}

function trackFormSubmissions() {
    const forms = document.querySelectorAll('form, .input-card');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            trackEvent('form', 'submit', this.id || 'citation_form');
        });
    });
}

// History Functions
function saveToHistory(citation) {
    try {
        const history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
        history.unshift({
            citation,
            style: currentStyle,
            timestamp: new Date().toISOString()
        });
        
        // Keep last 50 items
        if (history.length > 50) {
            history.length = 50;
        }
        
        localStorage.setItem('citationHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

// Alert Functions
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles if not exist
    if (!document.querySelector('#alert-styles')) {
        const styles = document.createElement('style');
        styles.id = 'alert-styles';
        styles.textContent = `
            .alert {
                position: fixed;
                top: 80px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 9999;
                max-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .alert-info { background: #3498db; color: white; }
            .alert-error { background: #e74c3c; color: white; }
            .alert-success { background: #2ecc71; color: white; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

// URL Parameter Handling
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const style = urlParams.get('style');
    
    if (style && ['apa', 'mla', 'chicago'].includes(style)) {
        switchStyle(style);
    }
}

// Service Worker Setup (for PWA capabilities)
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
        });
    }
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Error:', e.error);
    
    if (typeof gtag === 'function') {
        gtag('event', 'exception', {
            description: e.error.message,
            fatal: false
        });
    }
});

// Performance Tracking
window.addEventListener('load', function() {
    if (typeof gtag === 'function') {
        const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                        window.performance.timing.navigationStart;
        
        gtag('event', 'timing_complete', {
            name: 'load',
            value: loadTime,
            event_category: 'Performance'
        });
    }
});

// Export functions for HTML onclick attributes
window.generateCitation = generateCitation;
window.fillExample = fillExample;
window.clearForm = clearForm;
window.copyCitation = copyCitation;
window.downloadCitation = downloadCitation;
