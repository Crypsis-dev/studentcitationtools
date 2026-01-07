// StudentCitationTools.com - Complete Citation Generator
// Version: 2.0.0 - APA, MLA, Chicago Support
// Last Updated: 2024-01-07

// Global Variables
let currentStyle = 'apa';
let citationHistory = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('StudentCitationTools.com - Full Suite Loaded');
    initializeApp();
});

function initializeApp() {
    // Setup style tabs
    setupStyleTabs();
    
    // Setup source type change listener
    document.getElementById('sourceType').addEventListener('change', updateDynamicFields);
    
    // Load history
    loadHistory();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize with APA fields
    updateDynamicFields();
    updateStyleInfo();
    
    // Show welcome message
    setTimeout(() => {
        if (!localStorage.getItem('visited')) {
            showMessage('Welcome to StudentCitationTools.com! Generate citations in APA, MLA, or Chicago style.', 'success');
            localStorage.setItem('visited', 'true');
        }
    }, 1000);
}

// Setup Style Tabs
function setupStyleTabs() {
    const tabs = document.querySelectorAll('.style-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update current style
            currentStyle = this.dataset.style;
            
            // Update UI
            updateStyleBadge();
            updateStyleInfo();
            updateGuideExamples();
            updateDynamicFields();
            
            // Clear result
            clearResult();
            
            // Track event
            trackEvent('style_changed', currentStyle);
        });
    });
}

// Update Style Badge
function updateStyleBadge() {
    const badge = document.getElementById('styleBadge');
    const styles = {
        'apa': 'APA 7th',
        'mla': 'MLA 9th',
        'chicago': 'Chicago 17th'
    };
    badge.textContent = styles[currentStyle];
    
    // Update color
    const colors = {
        'apa': '#3b82f6',
        'mla': '#10b981',
        'chicago': '#8b5cf6'
    };
    badge.style.background = colors[currentStyle];
}

// Update Style Info
function updateStyleInfo() {
    const info = document.getElementById('styleInfo');
    const styles = {
        'apa': '<strong>APA (American Psychological Association):</strong> Used in psychology, education, and social sciences. Author-Date format.',
        'mla': '<strong>MLA (Modern Language Association):</strong> Used in humanities, literature, and arts. Author-Page format.',
        'chicago': '<strong>Chicago Manual of Style:</strong> Used in history, business, and fine arts. Notes-Bibliography or Author-Date format.'
    };
    info.innerHTML = `<p>${styles[currentStyle]}</p>`;
}

// Update Guide Examples
function updateGuideExamples() {
    const guides = document.querySelectorAll('.guide-item');
    guides.forEach(guide => {
        guide.style.display = guide.dataset.style === currentStyle ? 'block' : 'none';
    });
}

// Update Dynamic Fields Based on Source Type
function updateDynamicFields() {
    const sourceType = document.getElementById('sourceType').value;
    const container = document.getElementById('dynamicFields');
    
    let fields = '';
    
    switch(sourceType) {
        case 'book':
            fields = `
                <div class="form-group">
                    <label for="publisher">Publisher *</label>
                    <input type="text" id="publisher" placeholder="e.g., Oxford University Press">
                </div>
                <div class="form-group">
                    <label for="edition">Edition (Optional)</label>
                    <input type="text" id="edition" placeholder="e.g., 2nd edition">
                </div>
            `;
            break;
            
        case 'journal':
            fields = `
                <div class="form-group">
                    <label for="journal">Journal Name *</label>
                    <input type="text" id="journal" placeholder="e.g., Journal of Educational Psychology">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="volume">Volume</label>
                        <input type="text" id="volume" placeholder="e.g., 45">
                    </div>
                    <div class="form-group">
                        <label for="issue">Issue</label>
                        <input type="text" id="issue" placeholder="e.g., 2">
                    </div>
                </div>
                <div class="form-group">
                    <label for="pages">Page Range</label>
                    <input type="text" id="pages" placeholder="e.g., 123-145">
                </div>
            `;
            break;
            
        case 'website':
            fields = `
                <div class="form-group">
                    <label for="website">Website/Organization</label>
                    <input type="text" id="website" placeholder="e.g., World Health Organization">
                </div>
                <div class="form-group">
                    <label for="accessDate">Access Date (MLA Only)</label>
                    <input type="date" id="accessDate">
                </div>
            `;
            break;
            
        case 'thesis':
            fields = `
                <div class="form-group">
                    <label for="institution">Institution *</label>
                    <input type="text" id="institution" placeholder="e.g., Harvard University">
                </div>
                <div class="form-group">
                    <label for="degree">Degree Type</label>
                    <input type="text" id="degree" placeholder="e.g., PhD dissertation">
                </div>
            `;
            break;
    }
    
    container.innerHTML = fields;
}

// Main Citation Generation Function
function generateCitation() {
    try {
        // Get form values
        const formData = getFormData();
        
        // Validate
        const validation = validateForm(formData);
        if (!validation.valid) {
            showMessage(validation.message, 'error');
            return;
        }
        
        // Generate citation based on style
        let citation;
        switch(currentStyle) {
            case 'apa':
                citation = generateAPA(formData);
                break;
            case 'mla':
                citation = generateMLA(formData);
                break;
            case 'chicago':
                citation = generateChicago(formData);
                break;
            default:
                citation = generateAPA(formData);
        }
        
        // Display result
        displayCitation(citation, formData.sourceType);
        
        // Save to history
        saveToHistory(citation, currentStyle);
        
        // Track event
        trackEvent('citation_generated', currentStyle + '_' + formData.sourceType);
        
    } catch (error) {
        console.error('Generation error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
}

// Get Form Data
function getFormData() {
    const sourceType = document.getElementById('sourceType').value;
    
    const data = {
        author: document.getElementById('author').value.trim(),
        year: document.getElementById('year').value.trim(),
        title: document.getElementById('title').value.trim(),
        sourceType: sourceType,
        url: document.getElementById('url').value.trim()
    };
    
    // Add fields based on source type
    switch(sourceType) {
        case 'book':
            data.publisher = document.getElementById('publisher')?.value.trim() || '';
            data.edition = document.getElementById('edition')?.value.trim() || '';
            break;
        case 'journal':
            data.journal = document.getElementById('journal')?.value.trim() || '';
            data.volume = document.getElementById('volume')?.value.trim() || '';
            data.issue = document.getElementById('issue')?.value.trim() || '';
            data.pages = document.getElementById('pages')?.value.trim() || '';
            break;
        case 'website':
            data.website = document.getElementById('website')?.value.trim() || '';
            data.accessDate = document.getElementById('accessDate')?.value || '';
            break;
        case 'thesis':
            data.institution = document.getElementById('institution')?.value.trim() || '';
            data.degree = document.getElementById('degree')?.value.trim() || '';
            break;
    }
    
    return data;
}

// Validate Form
function validateForm(data) {
    if (!data.author || !data.year || !data.title) {
        return { valid: false, message: 'Please fill in all required fields (Author, Year, and Title)' };
    }
    
    if (!/^\d{4}$/.test(data.year)) {
        return { valid: false, message: 'Please enter a valid 4-digit year (e.g., 2024)' };
    }
    
    // Source-specific validation
    if (data.sourceType === 'book' && !data.publisher) {
        return { valid: false, message: 'Publisher is required for books' };
    }
    
    if (data.sourceType === 'journal' && !data.journal) {
        return { valid: false, message: 'Journal name is required for journal articles' };
    }
    
    if (data.sourceType === 'website' && !data.url) {
        return { valid: false, message: 'URL is required for websites' };
    }
    
    return { valid: true, message: '' };
}

// ========== APA GENERATION ==========
function generateAPA(data) {
    let citation = '';
    
    // Format authors
    const authors = formatAuthorsAPA(data.author);
    citation += authors;
    
    // Add year
    citation += ` (${data.year}). `;
    
    // Add title (italicize for books, not for articles)
    if (data.sourceType === 'book' || data.sourceType === 'thesis') {
        citation += `<em>${formatTitleAPA(data.title)}</em>.`;
    } else {
        citation += `${formatTitleAPA(data.title, false)}.`;
    }
    
    // Add source-specific information
    switch(data.sourceType) {
        case 'book':
            if (data.edition && data.edition.match(/\d/)) {
                citation += ` (${data.edition}).`;
            }
            if (data.publisher) {
                citation += ` ${data.publisher}.`;
            }
            break;
            
        case 'journal':
            if (data.journal) {
                citation += ` <em>${data.journal}</em>`;
            }
            if (data.volume) {
                citation += `, ${data.volume}`;
                if (data.issue) {
                    citation += `(${data.issue})`;
                }
            }
            if (data.pages) {
                citation += `, ${data.pages}`;
            }
            citation += '.';
            break;
            
        case 'website':
            if (data.website) {
                citation += ` ${data.website}.`;
            }
            if (data.url) {
                citation += ` ${formatURL(data.url)}`;
            }
            break;
            
        case 'thesis':
            if (data.degree) {
                citation += ` [${data.degree}].`;
            }
            if (data.institution) {
                citation += ` ${data.institution}.`;
            }
            break;
    }
    
    // Add URL/DOI if not already added
    if (data.url && data.sourceType !== 'website') {
        citation += ` ${formatURL(data.url)}`;
    }
    
    return citation;
}

// Format authors for APA
function formatAuthorsAPA(authorString) {
    const authors = authorString.split(',').map(a => a.trim()).filter(a => a);
    const formatted = [];
    
    for (const author of authors) {
        const parts = author.split(' ').filter(p => p);
        if (parts.length === 0) continue;
        
        const lastName = parts[0];
        let initials = '';
        
        for (let i = 1; i < parts.length; i++) {
            if (parts[i]) {
                initials += parts[i].charAt(0).toUpperCase() + '. ';
            }
        }
        
        initials = initials.trim();
        formatted.push(lastName + (initials ? ', ' + initials : ''));
    }
    
    if (formatted.length === 0) return '';
    if (formatted.length === 1) return formatted[0];
    if (formatted.length === 2) return `${formatted[0]} & ${formatted[1]}`;
    
    // APA: List up to 20 authors
    return formatted.slice(0, 19).join(', ') + ', & ' + formatted[formatted.length - 1];
}

// ========== MLA GENERATION ==========
function generateMLA(data) {
    let citation = '';
    
    // Format authors (MLA uses full first names)
    const authors = formatAuthorsMLA(data.author);
    citation += authors;
    
    // Add title
    if (data.sourceType === 'book' || data.sourceType === 'thesis') {
        citation += `<em>${formatTitleMLA(data.title)}</em>.`;
    } else {
        citation += `"${formatTitleMLA(data.title, false)}."`;
    }
    
    // Add source-specific information
    switch(data.sourceType) {
        case 'book':
            if (data.publisher) {
                citation += ` ${data.publisher},`;
            }
            citation += ` ${data.year}.`;
            break;
            
        case 'journal':
            if (data.journal) {
                citation += ` <em>${data.journal}</em>,`;
            }
            if (data.volume) {
                citation += ` vol. ${data.volume},`;
            }
            if (data.issue) {
                citation += ` no. ${data.issue},`;
            }
            citation += ` ${data.year},`;
            if (data.pages) {
                citation += ` pp. ${data.pages}.`;
            }
            break;
            
        case 'website':
            if (data.website) {
                citation += ` ${data.website},`;
            }
            citation += ` ${data.year},`;
            if (data.url) {
                citation += ` ${cleanURL(data.url)}.`;
            }
            if (data.accessDate) {
                const date = new Date(data.accessDate);
                citation += ` Accessed ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
            }
            break;
            
        case 'thesis':
            citation += ` ${data.degree},`;
            if (data.institution) {
                citation += ` ${data.institution},`;
            }
            citation += ` ${data.year}.`;
            break;
    }
    
    // Add URL for non-website sources
    if (data.url && data.sourceType !== 'website') {
        citation += ` ${cleanURL(data.url)}.`;
    }
    
    return citation;
}

// Format authors for MLA
function formatAuthorsMLA(authorString) {
    const authors = authorString.split(',').map(a => a.trim()).filter(a => a);
    const formatted = [];
    
    for (const author of authors) {
        const parts = author.split(' ').filter(p => p);
        if (parts.length === 0) continue;
        
        const lastName = parts[0];
        const firstName = parts.slice(1).join(' ') || '';
        
        if (firstName) {
            formatted.push(`${lastName}, ${firstName}`);
        } else {
            formatted.push(lastName);
        }
    }
    
    if (formatted.length === 0) return '';
    if (formatted.length === 1) return formatted[0] + '. ';
    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}. `;
    
    // MLA: Use "et al." for 3+ authors
    return `${formatted[0]} et al. `;
}

// ========== CHICAGO GENERATION ==========
function generateChicago(data) {
    let citation = '';
    
    // Format authors
    const authors = formatAuthorsChicago(data.author);
    citation += authors;
    
    // Add year after title for notes-bibliography
    if (data.sourceType === 'book' || data.sourceType === 'thesis') {
        citation += `<em>${formatTitleChicago(data.title)}</em>.`;
    } else {
        citation += `"${formatTitleChicago(data.title, false)}."`;
    }
    
    // Add source-specific information
    switch(data.sourceType) {
        case 'book':
            if (data.publisher) {
                citation += ` ${data.publisher},`;
            }
            citation += ` ${data.year}.`;
            break;
            
        case 'journal':
            if (data.journal) {
                citation += ` <em>${data.journal}</em>`;
            }
            if (data.volume) {
                citation += ` ${data.volume},`;
            }
            if (data.issue) {
                citation += ` no. ${data.issue}`;
            }
            citation += ` (${data.year}):`;
            if (data.pages) {
                citation += ` ${data.pages}.`;
            }
            break;
            
        case 'website':
            citation += ` ${data.website}.`;
            citation += ` Last modified ${data.year}.`;
            if (data.url) {
                citation += ` ${formatURL(data.url)}.`;
            }
            break;
            
        case 'thesis':
            citation += ` ${data.degree}, ${data.institution}, ${data.year}.`;
            break;
    }
    
    return citation;
}

// Format authors for Chicago
function formatAuthorsChicago(authorString) {
    const authors = authorString.split(',').map(a => a.trim()).filter(a => a);
    const formatted = [];
    
    for (const author of authors) {
        const parts = author.split(' ').filter(p => p);
        if (parts.length === 0) continue;
        
        const lastName = parts[0];
        const firstName = parts.slice(1).join(' ') || '';
        
        if (firstName) {
            formatted.push(`${firstName} ${lastName}`);
        } else {
            formatted.push(lastName);
        }
    }
    
    if (formatted.length === 0) return '';
    if (formatted.length === 1) return formatted[0] + '. ';
    if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}. `;
    
    // Chicago: List all authors
    return formatted.slice(0, -1).join(', ') + ', and ' + formatted[formatted.length - 1] + '. ';
}

// ========== HELPER FUNCTIONS ==========
function formatTitleAPA(title, italicize = true) {
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'with', 'in', 'of'];
    const words = title.toLowerCase().split(' ');
    
    const formatted = words.map((word, index) => {
        if (index === 0) return capitalize(word);
        if (smallWords.includes(word) && index !== words.length - 1) return word;
        return capitalize(word);
    });
    
    let result = formatted.join(' ');
    return italicize ? `<em>${result}</em>` : result;
}

function formatTitleMLA(title, italicize = true) {
    // MLA uses title case for major words
    const words = title.toLowerCase().split(' ');
    const formatted = words.map(capitalize);
    
    let result = formatted.join(' ');
    return italicize ? `<em>${result}</em>` : result;
}

function formatTitleChicago(title, italicize = true) {
    // Chicago uses headline style capitalization
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'with', 'in', 'of'];
    const words = title.toLowerCase().split(' ');
    
    const formatted = words.map((word, index) => {
        if (index === 0 || index === words.length - 1) return capitalize(word);
        if (smallWords.includes(word)) return word;
        return capitalize(word);
    });
    
    let result = formatted.join(' ');
    return italicize ? `<em>${result}</em>` : result;
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatURL(url) {
    if (!url) return '';
    
    if (url.includes('doi.org') || url.startsWith('10.')) {
        const doi = url.replace('https://doi.org/', '').replace('doi:', '');
        return `https://doi.org/${doi}`;
    }
    
    return url;
}

function cleanURL(url) {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// ========== UI FUNCTIONS ==========
function displayCitation(citation, sourceType) {
    const resultBox = document.getElementById('result');
    const plainCitation = citation.replace(/<[^>]*>/g, '');
    
    const styleNames = {
        'apa': 'APA 7th Edition',
        'mla': 'MLA 9th Edition',
        'chicago': 'Chicago 17th Edition'
    };
    
    const typeNames = {
        'book': 'Book',
        'journal': 'Journal Article',
        'website': 'Website',
        'thesis': 'Thesis/Dissertation'
    };
    
    resultBox.innerHTML = `
        <div class="citation-output">
            <div class="citation-header">
                <div class="citation-meta">
                    <span class="citation-style">${styleNames[currentStyle]}</span>
                    <span class="citation-type">${typeNames[sourceType] || 'Source'}</span>
                </div>
                <small>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
            </div>
            <div class="citation-content">${citation}</div>
            <div class="citation-footer">
                <small>Click "Copy Citation" to use in your paper</small>
            </div>
        </div>
    `;
    
    resultBox.dataset.citation = plainCitation;
    resultBox.dataset.style = currentStyle;
    
    showMessage('Citation generated successfully!', 'success');
}

function copyCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        showMessage('Please generate a citation first', 'error');
        return;
    }
    
    navigator.clipboard.writeText(citation)
        .then(() => {
            showMessage('✅ Citation copied to clipboard!', 'success');
            
            // Button feedback
            const copyBtn = document.getElementById('copyBtn');
            const original = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
            copyBtn.disabled = true;
            
            setTimeout(() => {
                copyBtn.innerHTML = original;
                copyBtn.disabled = false;
            }, 2000);
            
            trackEvent('citation_copied', currentStyle);
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showMessage('Failed to copy. Please try again.', 'error');
        });
}

function downloadCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    const style = resultBox.dataset.style;
    
    if (!citation) {
        showMessage('Please generate a citation first', 'error');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${style.toUpperCase()}_Citation_${timestamp}.txt`;
    const blob = new Blob([citation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('📥 Citation downloaded!', 'success');
    trackEvent('citation_downloaded', style);
}

function exportBibtex() {
    const data = getFormData();
    let bibtex = '';
    
    switch(data.sourceType) {
        case 'book':
            bibtex = `@book{key,\n  author = "${data.author}",\n  title = "${data.title}",\n  publisher = "${data.publisher || ''}",\n  year = "${data.year}"\n}`;
            break;
        case 'journal':
            bibtex = `@article{key,\n  author = "${data.author}",\n  title = "${data.title}",\n  journal = "${data.journal || ''}",\n  year = "${data.year}",\n  volume = "${data.volume || ''}",\n  pages = "${data.pages || ''}"\n}`;
            break;
        default:
            bibtex = `@misc{key,\n  author = "${data.author}",\n  title = "${data.title}",\n  year = "${data.year}",\n  url = "${data.url || ''}"\n}`;
    }
    
    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `citation_${new Date().getTime()}.bib`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('📑 BibTeX file exported!', 'success');
    trackEvent('bibtex_exported', currentStyle);
}

function fillExample() {
    const examples = {
        'apa': {
            author: 'Kahneman, Daniel',
            year: '2011',
            title: 'Thinking, Fast and Slow',
            publisher: 'Farrar, Straus and Giroux',
            url: 'https://doi.org/10.1000/example'
        },
        'mla': {
            author: 'Smith, John, Johnson, Mary',
            year: '2023',
            title: 'Modern Education Techniques',
            journal: 'Journal of Educational Research',
            volume: '45',
            issue: '2',
            pages: '123-145'
        },
        'chicago': {
            author: 'World Health Organization',
            year: '2023',
            title: 'Global Health Report 2023',
            website: 'World Health Organization',
            url: 'https://www.who.int/reports/global-health-2023'
        }
    };
    
    const example = examples[currentStyle];
    
    document.getElementById('author').value = example.author;
    document.getElementById('year').value = example.year;
    document.getElementById('title').value = example.title;
    
    if (example.publisher) {
        document.getElementById('sourceType').value = 'book';
        updateDynamicFields();
        setTimeout(() => {
            document.getElementById('publisher').value = example.publisher;
        }, 100);
    } else if (example.journal) {
        document.getElementById('sourceType').value = 'journal';
        updateDynamicFields();
        setTimeout(() => {
            document.getElementById('journal').value = example.journal;
            document.getElementById('volume').value = example.volume;
            document.getElementById('issue').value = example.issue;
            document.getElementById('pages').value = example.pages;
        }, 100);
    } else {
        document.getElementById('sourceType').value = 'website';
        updateDynamicFields();
        setTimeout(() => {
            document.getElementById('website').value = example.website;
        }, 100);
    }
    
    document.getElementById('url').value = example.url || '';
    
    showMessage('Example loaded! Click "Generate Citation" to see it in action.', 'success');
    trackEvent('example_loaded', currentStyle);
}

function clearForm() {
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('title').value = '';
    document.getElementById('url').value = '';
    
    document.getElementById('sourceType').value = 'book';
    updateDynamicFields();
    
    clearResult();
    
    showMessage('Form cleared successfully!', 'success');
    trackEvent('form_cleared');
}

function clearResult() {
    const resultBox = document.getElementById('result');
    resultBox.innerHTML = `
        <div class="result-placeholder">
            <div class="placeholder-icon">📄</div>
            <p>Select a style and fill the form to generate citation</p>
        </div>
    `;
    delete resultBox.dataset.citation;
    delete resultBox.dataset.style;
}

// ========== HISTORY FUNCTIONS ==========
function saveToHistory(citation, style) {
    const historyItem = {
        citation: citation.replace(/<[^>]*>/g, ''),
        style: style,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    citationHistory.unshift(historyItem);
    if (citationHistory.length > 10) {
        citationHistory = citationHistory.slice(0, 10);
    }
    
    localStorage.setItem('citationHistory', JSON.stringify(citationHistory));
    updateHistoryDisplay();
}

function loadHistory() {
    const saved = localStorage.getItem('citationHistory');
    if (saved) {
        citationHistory = JSON.parse(saved);
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const container = document.getElementById('historyList');
    
    if (citationHistory.length === 0) {
        container.innerHTML = '<div class="history-empty">No citations generated yet</div>';
        return;
    }
    
    let html = '';
    citationHistory.forEach(item => {
        const date = new Date(item.timestamp);
        const timeString = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        html += `
            <div class="history-item" data-id="${item.id}">
                <div class="history-meta">
                    <span class="history-style">${item.style.toUpperCase()}</span>
                    <span class="history-time">${timeString}</span>
                </div>
                <div class="history-citation">${item.citation.substring(0, 100)}${item.citation.length > 100 ? '...' : ''}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ========== UTILITY FUNCTIONS ==========
function showMessage(message, type = 'info') {
    const div = document.createElement('div');
    div.className = type === 'error' ? 'error-message' : 'success-message';
    div.innerHTML = type === 'error' ? `❌ ${message}` : `✅ ${message}`;
    
    // Remove existing messages
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    // Insert after hero
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.parentNode.insertBefore(div, hero.nextSibling);
    }
    
    // Auto remove
    setTimeout(() => {
        if (div.parentNode) div.parentNode.removeChild(div);
    }, type === 'error' ? 5000 : 3000);
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateCitation();
        }
        
        // Ctrl/Cmd + C to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
            const focused = document.activeElement;
            if (!focused.matches('input, textarea, select')) {
                copyCitation();
            }
        }
        
        // Escape to clear
        if (e.key === 'Escape') {
            clearForm();
        }
        
        // Number keys to switch styles
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    document.querySelector('[data-style="apa"]').click();
                    break;
                case '2':
                    document.querySelector('[data-style="mla"]').click();
                    break;
                case '3':
                    document.querySelector('[data-style="chicago"]').click();
                    break;
            }
        }
    });
}

function trackEvent(action, label = '') {
    console.log(`[Analytics] ${action}${label ? ' - ' + label : ''}`);
    
    // For future Google Analytics integration
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', action, { 'event_label': label });
    // }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateAPA,
        generateMLA,
        generateChicago,
        formatAuthorsAPA,
        formatAuthorsMLA,
        formatAuthorsChicago
    };
}
