// Citation Generator - Complete Solution
let currentStyle = 'apa';

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Citation Generator initializing...');
    
    // Initialize mobile menu FIRST
    initializeMobileMenu();
    
    // Initialize other modules
    initializeTabs();
    initializeForm();
    initializeCitationGenerator();
    checkURLParameters();
    
    console.log('Citation Generator initialized successfully!');
});

// ======================
// MOBILE MENU FUNCTIONS - SIMPLIFIED AND FIXED
// ======================
function initializeMobileMenu() {
    console.log('Initializing mobile menu...');
    
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    
    if (!mobileMenuBtn || !mainNav) {
        console.error('Mobile menu elements not found!');
        return;
    }
    
    console.log('Mobile menu elements found');
    
    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Mobile menu button clicked');
        
        // Toggle active class on nav
        mainNav.classList.toggle('active');
        
        // Update button text and aria-label
        if (mainNav.classList.contains('active')) {
            mobileMenuBtn.textContent = '✕';
            mobileMenuBtn.setAttribute('aria-label', 'Close menu');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenuBtn.textContent = '☰';
            mobileMenuBtn.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when clicking on a link
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                mobileMenuBtn.textContent = '☰';
                mobileMenuBtn.setAttribute('aria-label', 'Open menu');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close menu when clicking outside (on overlay)
    document.addEventListener('click', function(e) {
        if (mainNav.classList.contains('active') && 
            !mainNav.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            mainNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
            mobileMenuBtn.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
            mobileMenuBtn.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu on window resize (when going to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
            mainNav.classList.remove('active');
            mobileMenuBtn.textContent = '☰';
            mobileMenuBtn.setAttribute('aria-label', 'Open menu');
            document.body.style.overflow = '';
        }
    });
    
    console.log('Mobile menu initialized successfully');
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
        alert('Please fill in all required fields (Author, Year, Title)');
        return;
    }
    
    if (year && (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1)) {
        alert('Please enter a valid publication year (1000-' + (new Date().getFullYear() + 1) + ')');
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
        
    } catch (error) {
        console.error('Citation generation error:', error);
        alert('Error generating citation. Please check your input.');
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
            citation = `${authors} (${year}). ${title}.`;
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
}

function copyCitation() {
    const result = document.getElementById('result');
    if (!result) return;
    
    const text = result.textContent;
    if (!text || text.includes('Select a style')) {
        alert('No citation to copy. Please generate a citation first.');
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
        
        alert('Citation copied to clipboard!');
        
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy. Please try again.');
    });
}

function downloadCitation() {
    const result = document.getElementById('result');
    if (!result) return;
    
    const text = result.textContent;
    if (!text || text.includes('Select a style')) {
        alert('No citation to download. Please generate a citation first.');
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
        
        alert('Citation downloaded successfully!');
        
    } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download citation.');
    }
}

// ======================
// HELPER FUNCTIONS
// ======================
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
// EXPORT FUNCTIONS FOR HTML onclick ATTRIBUTES
// ======================
// Make functions available globally for onclick attributes
window.generateCitation = generateCitation;
window.fillExample = fillExample;
window.clearForm = clearForm;
window.copyCitation = copyCitation;
window.downloadCitation = downloadCitation;

console.log('Citation Generator script loaded successfully');
