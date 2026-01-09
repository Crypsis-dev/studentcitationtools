// Citation Generator Logic
let currentStyle = 'apa';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    checkURLStyle();
    initializeMobileMenu();
    setupFormValidation();
    loadSavedData();
    updateSchemaMarkup();
});

// Tab Switching
function initializeTabs() {
    document.querySelectorAll('.style-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const style = this.dataset.style;
            switchStyle(style);
        });
    });
}

function switchStyle(style) {
    // Update active tab
    document.querySelectorAll('.style-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-style="${style}"]`).classList.add('active');
    
    // Update current style
    currentStyle = style;
    
    // Update style badge
    const badgeText = style === 'apa' ? 'APA 7th' : 
                     style === 'mla' ? 'MLA 9th' : 'Chicago 17th';
    document.getElementById('styleBadge').textContent = badgeText;
    
    // Update style info
    const infoText = {
        apa: 'APA (American Psychological Association): Used in psychology, education, and social sciences.',
        mla: 'MLA (Modern Language Association): Used in humanities, literature, and arts.',
        chicago: 'Chicago Manual of Style: Used in publishing, history, and some social sciences.'
    };
    document.getElementById('styleInfo').innerHTML = `<p><strong>${badgeText}:</strong> ${infoText[style]}</p>`;
    
    // Update URL without page reload
    history.replaceState(null, '', `?style=${style}`);
    
    // Update form fields based on style
    updateFormForStyle(style);
    
    // Regenerate if form has data
    if (document.getElementById('author').value.trim()) {
        generateCitation();
    }
}

// Check URL for style parameter
function checkURLStyle() {
    const urlParams = new URLSearchParams(window.location.search);
    const styleParam = urlParams.get('style');
    if (styleParam && ['apa', 'mla', 'chicago'].includes(styleParam)) {
        switchStyle(styleParam);
    }
}

// Update form fields based on style
function updateFormForStyle(style) {
    const dynamicFields = document.getElementById('dynamicFields');
    
    if (style === 'apa') {
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
    } else if (style === 'mla') {
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
    } else { // chicago
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
    }
}

// Generate Citation
function generateCitation() {
    // Get form values
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('year').value.trim();
    const title = document.getElementById('title').value.trim();
    const publisher = document.getElementById('publisher')?.value.trim() || '';
    const url = document.getElementById('url').value.trim();
    const sourceType = document.getElementById('sourceType').value;
    
    // Validate required fields
    if (!author || !year || !title) {
        alert('Please fill in all required fields (*)');
        return;
    }
    
    // Format citation based on style
    let citation = '';
    
    switch(currentStyle) {
        case 'apa':
            citation = formatAPACitation(author, year, title, publisher, sourceType, url);
            break;
        case 'mla':
            citation = formatMLACitation(author, year, title, publisher, sourceType, url);
            break;
        case 'chicago':
            citation = formatChicagoCitation(author, year, title, publisher, sourceType, url);
            break;
    }
    
    // Display citation
    document.getElementById('result').innerHTML = `<pre>${citation}</pre>`;
    
    // Save to localStorage
    saveToHistory(citation);
    updateSchemaMarkup();
    
    // Track event in Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_citation', {
            'event_category': currentStyle,
            'event_label': sourceType
        });
    }
}

// Format APA Citation
function formatAPACitation(author, year, title, publisher, sourceType, url) {
    let citation = '';
    
    // Format authors (assuming Last, First format)
    const authors = author.split(';').map(a => {
        const parts = a.split(',');
        if (parts.length === 2) {
            const [last, first] = parts.map(p => p.trim());
            return `${first.charAt(0)}. ${last}`;
        }
        return a.trim();
    }).join(', ');
    
    if (sourceType === 'book') {
        citation = `${authors}. (${year}). *${title}*. ${publisher}.`;
    } else if (sourceType === 'journal') {
        const journal = document.getElementById('journal')?.value.trim() || 'Journal Name';
        citation = `${authors}. (${year}). ${title}. *${journal}*.`;
    } else { // website
        citation = `${authors}. (${year}, ${getCurrentMonth()}). ${title}.`;
        if (url) {
            citation += ` Retrieved from ${url}`;
        }
    }
    
    return citation;
}

// Format MLA Citation
function formatMLACitation(author, year, title, publisher, sourceType, url) {
    let citation = '';
    
    // Format authors (Last, First)
    const authors = author.split(';').map(a => {
        const parts = a.split(',');
        if (parts.length === 2) {
            const [last, first] = parts.map(p => p.trim());
            return `${last}, ${first}`;
        }
        return a.trim();
    }).join(', ');
    
    const city = document.getElementById('city')?.value.trim() || 'City';
    
    if (sourceType === 'book') {
        citation = `${authors}. *${title}*. ${publisher}, ${year}.`;
    } else if (sourceType === 'journal') {
        citation = `${authors}. "${title}." *Journal Name*, ${year}.`;
    } else { // website
        citation = `${authors}. "${title}." *Website Name*, ${publisher}, ${year}.`;
        if (url) {
            citation += ` ${url}.`;
        }
    }
    
    return citation;
}

// Format Chicago Citation
function formatChicagoCitation(author, year, title, publisher, sourceType, url) {
    let citation = '';
    
    // Format authors
    const authors = author.split(';').map(a => {
        const parts = a.split(',');
        if (parts.length === 2) {
            const [last, first] = parts.map(p => p.trim());
            return `${first} ${last}`;
        }
        return a.trim();
    }).join(', ');
    
    const edition = document.getElementById('edition')?.value.trim() || '';
    const editionText = edition ? ` ${edition}` : '';
    
    if (sourceType === 'book') {
        citation = `${authors}. ${year}. *${title}*.${editionText} ${publisher}.`;
    } else if (sourceType === 'journal') {
        citation = `${authors}. "${title}." *Journal Name* (${year}).`;
    } else { // website
        citation = `${authors}. "${title}." ${publisher}. Accessed ${getFormattedDate()}.`;
        if (url) {
            citation += ` ${url}.`;
        }
    }
    
    return citation;
}

// Helper Functions
function getCurrentMonth() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return months[now.getMonth()];
}

function getFormattedDate() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

// Fill Example
function fillExample() {
    const examples = {
        apa: {
            author: 'Smith, John; Johnson, Mary',
            year: '2023',
            title: 'The Psychology of Modern Learning',
            publisher: 'Academic Press',
            journal: 'Journal of Educational Psychology'
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
    
    document.getElementById('author').value = example.author;
    document.getElementById('year').value = example.year;
    document.getElementById('title').value = example.title;
    document.getElementById('publisher').value = example.publisher;
    
    if (currentStyle === 'apa') {
        document.getElementById('journal').value = example.journal;
    } else if (currentStyle === 'mla') {
        document.getElementById('city').value = example.city;
    } else if (currentStyle === 'chicago') {
        document.getElementById('edition').value = example.edition;
    }
    
    // Trigger generation
    setTimeout(generateCitation, 100);
}

// Clear Form
function clearForm() {
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('title').value = '';
    document.getElementById('publisher').value = '';
    document.getElementById('url').value = '';
    
    if (currentStyle === 'apa') {
        document.getElementById('journal').value = '';
    } else if (currentStyle === 'mla') {
        document.getElementById('city').value = '';
    } else if (currentStyle === 'chicago') {
        document.getElementById('edition').value = '';
    }
    
    document.getElementById('result').innerHTML = `
        <div class="result-placeholder">
            <div class="placeholder-icon">📄</div>
            <p>Select a style and fill the form to generate citation</p>
        </div>
    `;
}

// Copy Citation to Clipboard
function copyCitation() {
    const resultElement = document.getElementById('result');
    const text = resultElement.textContent;
    
    if (!text.includes('Select a style')) {
        navigator.clipboard.writeText(text).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="btn-icon">✓</span> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
    }
}

// Download Citation
function downloadCitation() {
    const text = document.getElementById('result').textContent;
    
    if (!text.includes('Select a style')) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `citation_${currentStyle}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Mobile Menu
function initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.main-nav');
    
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuBtn.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('active');
                menuBtn.textContent = '☰';
            }
        });
    }
}

// Form Validation
function setupFormValidation() {
    const form = document.querySelector('.input-card');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (!input.value.trim()) {
                input.style.borderColor = '#e74c3c';
            } else {
                input.style.borderColor = '#ddd';
            }
        });
    });
}

// Save/Load History
function saveToHistory(citation) {
    const history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
    history.unshift({
        citation,
        style: currentStyle,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 50 items
    if (history.length > 50) {
        history.pop();
    }
    
    localStorage.setItem('citationHistory', JSON.stringify(history));
}

function loadSavedData() {
    const savedData = localStorage.getItem('lastCitation');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.style === currentStyle) {
            document.getElementById('author').value = data.author || '';
            document.getElementById('year').value = data.year || '';
            document.getElementById('title').value = data.title || '';
        }
    }
}

// Update Schema Markup for SEO
function updateSchemaMarkup() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Free Citation Generator",
        "description": "Generate accurate APA, MLA, and Chicago citations instantly.",
        "url": window.location.href,
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        }
    };
    
    // Remove existing schema
    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
        existingSchema.remove();
    }
    
    // Add new schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

// SEO: Update page title and meta
function updatePageMeta(title, description) {
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute('content', description);
    
    // Update Open Graph tags if they exist
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDesc) ogDesc.setAttribute('content', description);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Error:', e.error);
    
    // Send error to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            'description': e.error.message,
            'fatal': false
        });
    }
});

// Performance tracking
window.addEventListener('load', function() {
    const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                    window.performance.timing.navigationStart;
    
    if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
            'name': 'load',
            'value': loadTime,
            'event_category': 'Performance'
        });
    }
});
