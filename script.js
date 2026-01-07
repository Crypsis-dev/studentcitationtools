// StudentCitationTools.com - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tool
    console.log('StudentCitationTools.com loaded successfully');
    
    // Check for saved preferences
    loadPreferences();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Set current year in footer
    document.querySelector('footer .footer-bottom p').innerHTML = 
        document.querySelector('footer .footer-bottom p').innerHTML.replace('2024', new Date().getFullYear());
});

// Toggle fields based on source type
function toggleFields() {
    const sourceType = document.getElementById('sourceType').value;
    const bookFields = document.getElementById('bookFields');
    const journalFields = document.getElementById('journalFields');
    
    if (sourceType === 'book') {
        bookFields.classList.remove('hidden');
        journalFields.classList.add('hidden');
        // Update required fields
        document.getElementById('publisher').required = true;
        document.getElementById('journalName').required = false;
    } else if (sourceType === 'journal') {
        bookFields.classList.add('hidden');
        journalFields.classList.remove('hidden');
        // Update required fields
        document.getElementById('publisher').required = false;
        document.getElementById('journalName').required = true;
    } else {
        // For website, thesis, etc.
        bookFields.classList.add('hidden');
        journalFields.classList.add('hidden');
        document.getElementById('publisher').required = false;
        document.getElementById('journalName').required = false;
    }
}

// Generate APA citation
function generateCitation() {
    // Get input values
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('year').value.trim();
    const title = document.getElementById('title').value.trim();
    const sourceType = document.getElementById('sourceType').value;
    
    // Validate required fields
    if (!author || !year || !title) {
        showError('Please fill in all required fields (Author, Year, and Title)');
        return;
    }
    
    if (year.length !== 4 || isNaN(year)) {
        showError('Please enter a valid 4-digit year (e.g., 2024)');
        return;
    }
    
    // Format authors
    const formattedAuthors = formatAuthors(author);
    if (!formattedAuthors) {
        showError('Please enter author names in the format: Last Name, First Initial.');
        return;
    }
    
    // Build citation based on source type
    let citation = '';
    
    switch(sourceType) {
        case 'book':
            citation = generateBookCitation(formattedAuthors, year, title);
            break;
        case 'journal':
            citation = generateJournalCitation(formattedAuthors, year, title);
            break;
        case 'website':
            citation = generateWebsiteCitation(formattedAuthors, year, title);
            break;
        case 'thesis':
            citation = generateThesisCitation(formattedAuthors, year, title);
            break;
        default:
            citation = generateBookCitation(formattedAuthors, year, title);
    }
    
    // Display citation
    displayCitation(citation);
    
    // Save to history
    saveToHistory(citation);
    
    // Track usage
    trackUsage('citation_generated', sourceType);
}

// Generate book citation
function generateBookCitation(authors, year, title) {
    const publisher = document.getElementById('publisher').value.trim();
    const location = document.getElementById('location').value.trim();
    const url = document.getElementById('url').value.trim();
    
    if (!publisher) {
        showError('Publisher is required for book citations');
        return '';
    }
    
    let citation = `${authors} (${year}). `;
    citation += `<em>${formatTitle(title)}</em>. `;
    
    if (location) {
        citation += `${location}: `;
    }
    
    citation += `${publisher}.`;
    
    if (url) {
        citation += addURLOrDOI(url);
    }
    
    return citation;
}

// Generate journal citation
function generateJournalCitation(authors, year, title) {
    const journalName = document.getElementById('journalName').value.trim();
    const volume = document.getElementById('volume').value.trim();
    const issue = document.getElementById('issue').value.trim();
    const pages = document.getElementById('pages').value.trim();
    const url = document.getElementById('url').value.trim();
    
    if (!journalName) {
        showError('Journal name is required for journal articles');
        return '';
    }
    
    let citation = `${authors} (${year}). `;
    citation += `${formatTitle(title, false)}. `;
    citation += `<em>${formatTitle(journalName)}</em>`;
    
    if (volume) {
        citation += `, ${volume}`;
        if (issue) {
            citation += `(${issue})`;
        }
    }
    
    if (pages) {
        citation += `, ${pages}`;
    }
    
    citation += '.';
    
    if (url) {
        citation += addURLOrDOI(url);
    }
    
    return citation;
}

// Generate website citation
function generateWebsiteCitation(authors, year, title) {
    const url = document.getElementById('url').value.trim();
    
    if (!url) {
        showError('URL is required for website citations');
        return '';
    }
    
    let citation = `${authors} (${year}). `;
    citation += `<em>${formatTitle(title)}</em>. `;
    
    // Extract website name from URL if possible
    try {
        const urlObj = new URL(url);
        citation += `${urlObj.hostname}. `;
    } catch (e) {
        // If URL is invalid, just include the URL
    }
    
    citation += `Retrieved from ${url}`;
    
    return citation;
}

// Generate thesis citation
function generateThesisCitation(authors, year, title) {
    const url = document.getElementById('url').value.trim();
    
    let citation = `${authors} (${year}). `;
    citation += `<em>${formatTitle(title)}</em> `;
    citation += `[Unpublished doctoral dissertation]. `;
    
    // Try to get institution from publisher field
    const publisher = document.getElementById('publisher').value.trim();
    if (publisher) {
        citation += `${publisher}.`;
    }
    
    if (url) {
        citation += ` ${url}`;
    }
    
    return citation;
}

// Format author names
function formatAuthors(authorsString) {
    const authors = authorsString.split(',').map(author => author.trim());
    const formattedAuthors = [];
    
    for (const author of authors) {
        const parts = author.split(' ');
        if (parts.length === 0) continue;
        
        const lastName = parts[0];
        const initials = parts.slice(1).map(name => {
            return name.charAt(0).toUpperCase() + '.';
        }).join(' ');
        
        if (lastName && initials) {
            formattedAuthors.push(`${lastName}, ${initials}`);
        } else {
            formattedAuthors.push(author);
        }
    }
    
    if (formattedAuthors.length === 0) return '';
    if (formattedAuthors.length === 1) return formattedAuthors[0];
    if (formattedAuthors.length === 2) return `${formattedAuthors[0]} & ${formattedAuthors[1]}`;
    
    // For 3+ authors, list all (APA 7th allows up to 20)
    return formattedAuthors.slice(0, -1).join(', ') + ', & ' + formattedAuthors[formattedAuthors.length - 1];
}

// Format title (sentence case for APA)
function formatTitle(title, italicize = true) {
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'with', 'in', 'of'];
    const words = title.toLowerCase().split(' ');
    
    const formatted = words.map((word, index) => {
        // Always capitalize first word
        if (index === 0) {
            return capitalize(word);
        }
        // Don't capitalize small words unless they're the last word
        if (smallWords.includes(word) && index !== words.length - 1) {
            return word;
        }
        // Capitalize all other words
        return capitalize(word);
    });
    
    let result = formatted.join(' ');
    
    // Add italics if needed
    if (italicize) {
        result = `<em>${result}</em>`;
    }
    
    return result;
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Add URL or DOI
function addURLOrDOI(url) {
    if (!url) return '';
    
    // Clean the URL
    let cleanUrl = url.trim();
    
    // If it's a DOI, format it properly
    if (cleanUrl.includes('doi.org')) {
        const doi = cleanUrl.split('doi.org/')[1] || cleanUrl;
        return ` https://doi.org/${doi}`;
    } else if (cleanUrl.toLowerCase().startsWith('doi:')) {
        const doi = cleanUrl.substring(4).trim();
        return ` https://doi.org/${doi}`;
    } else if (cleanUrl.startsWith('10.')) {
        return ` https://doi.org/${cleanUrl}`;
    }
    
    // Regular URL
    if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
    }
    
    return ` ${cleanUrl}`;
}

// Display citation
function displayCitation(citation) {
    const resultBox = document.getElementById('result');
    
    if (!citation) {
        resultBox.innerHTML = '<div class="error-message">❌ Error generating citation. Please check your inputs.</div>';
        return;
    }
    
    resultBox.innerHTML = `
        <div class="citation-header">
            <h4>✅ APA Citation Generated Successfully:</h4>
            <small>Generated on ${new Date().toLocaleDateString()} at StudentCitationTools.com</small>
        </div>
        <div class="citation-content">${citation}</div>
        <div class="citation-footer">
            <small>📋 Click "Copy to Clipboard" to use in your paper</small>
        </div>
    `;
    
    resultBox.dataset.citation = citation.replace(/<[^>]*>/g, ''); // Store plain text version
    resultBox.style.color = '#2c3e50';
    
    // Scroll to result
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Copy citation to clipboard
function copyCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        showError('Please generate a citation first');
        return;
    }
    
    navigator.clipboard.writeText(citation).then(() => {
        showSuccess('✅ Citation copied to clipboard!');
        
        // Visual feedback
        const copyBtn = document.querySelector('.copy-btn');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
        copyBtn.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
        }, 2000);
        
        // Track copy action
        trackUsage('citation_copied');
    }).catch(err => {
        showError('Failed to copy. Please try again or use manual copy.');
    });
}

// Download citation
function downloadCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        showError('Please generate a citation first');
        return;
    }
    
    const blob = new Blob([citation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `APA_Citation_${timestamp}.txt`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('📥 Citation downloaded successfully!');
    
    // Visual feedback
    const downloadBtn = document.querySelector('.download-btn');
    const originalHTML = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<span class="btn-icon">📥</span> Downloaded!';
    downloadBtn.style.background = 'linear-gradient(90deg, #8e44ad, #7d3c98)';
    
    setTimeout(() => {
        downloadBtn.innerHTML = originalHTML;
        downloadBtn.style.background = '';
    }, 2000);
    
    // Track download
    trackUsage('citation_downloaded');
}

// Share citation
function shareCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        showError('Please generate a citation first');
        return;
    }
    
    const shareText = `Generated using StudentCitationTools.com - Free APA Citation Generator\n\n${citation}\n\nTry it at: https://studentcitationtools.com`;
    
    if (navigator.share) {
        navigator.share({
            title: 'APA Citation from StudentCitationTools.com',
            text: shareText,
            url: 'https://studentcitationtools.com'
        }).then(() => {
            showSuccess('Thanks for sharing!');
        }).catch(err => {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareText);
            showSuccess('📋 Share link copied to clipboard!');
        });
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        showSuccess('📋 Share link copied to clipboard!');
    }
    
    trackUsage('citation_shared');
}

// Fill example
function fillExample() {
    document.getElementById('author').value = 'Smith, John A., Johnson, Mary L.';
    document.getElementById('year').value = '2024';
    document.getElementById('title').value = 'The Psychology of Modern Learning in Digital Environments';
    document.getElementById('sourceType').value = 'book';
    document.getElementById('publisher').value = 'Academic Press';
    document.getElementById('location').value = 'New York, NY';
    document.getElementById('url').value = 'https://doi.org/10.1000/example123';
    
    toggleFields();
    showSuccess('Example data filled. Click "Generate APA Citation" to see it in action!');
}

// Clear all inputs
function clearAll() {
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('title').value = '';
    document.getElementById('sourceType').value = 'book';
    document.getElementById('publisher').value = '';
    document.getElementById('location').value = '';
    document.getElementById('journalName').value = '';
    document.getElementById('volume').value = '';
    document.getElementById('issue').value = '';
    document.getElementById('pages').value = '';
    document.getElementById('url').value = '';
    
    const resultBox = document.getElementById('result');
    resultBox.innerHTML = `
        <div class="result-placeholder">
            <div class="placeholder-icon">📄</div>
            <p>Your formatted APA citation will appear here after you click "Generate APA Citation"</p>
        </div>
    `;
    delete resultBox.dataset.citation;
    
    toggleFields();
    showInfo('All fields cleared. Ready for new citation!');
}

// Error handling
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `❌ ${message}`;
    errorDiv.style.cssText = `
        background: #ffebee;
        color: #c62828;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        border-left: 4px solid #c62828;
    `;
    
    // Remove any existing error
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Insert at top of tool container
    const toolContainer = document.querySelector('.tool-container');
    toolContainer.insertBefore(errorDiv, toolContainer.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `✅ ${message}`;
    successDiv.style.cssText = `
        background: #e8f5e9;
        color: #2e7d32;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        border-left: 4px solid #2e7d32;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transform = 'translateX(100%)';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

function showInfo(message) {
    console.log(`ℹ️ ${message}`);
}

// Utility functions
function loadPreferences() {
    // Load dark mode preference if any
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

function initializeTooltips() {
    // Add tooltips to form fields
    const tooltips = {
        'author': 'Enter author(s) in format: LastName, FirstInitial. For multiple authors: Smith, J., Johnson, M. L.',
        'year': '4-digit publication year. If no year, use (n.d.)',
        'title': 'Title of the book, article, or webpage',
        'url': 'For online sources, include DOI (preferred) or URL'
    };
    
    Object.keys(tooltips).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.title = tooltips[id];
        }
    });
}

function saveToHistory(citation) {
    // Save to localStorage for history (limited to 10)
    let history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
    history.unshift({
        citation: citation.replace(/<[^>]*>/g, ''),
        timestamp: new Date().toISOString(),
        type: document.getElementById('sourceType').value
    });
    
    // Keep only last 10
    history = history.slice(0, 10);
    localStorage.setItem('citationHistory', JSON.stringify(history));
}

function trackUsage(action, detail = '') {
    // Simple usage tracking (anonymous)
    const usage = {
        action,
        detail,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent.substring(0, 100)
    };
    
    // Store locally (limit to 100 entries)
    let usageLog = JSON.parse(localStorage.getItem('usageLog') || '[]');
    usageLog.push(usage);
    usageLog = usageLog.slice(-100);
    localStorage.setItem('usageLog', JSON.stringify(usageLog));
    
    // Could send to analytics here
    console.log(`📊 Usage: ${action} ${detail ? '(' + detail + ')' : ''}`);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateCitation();
        e.preventDefault();
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        clearAll();
    }
    
    // Ctrl/Cmd + C to copy (when result is focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const focused = document.activeElement;
        if (focused.id === 'result' || focused.closest('.result-box')) {
            copyCitation();
            e.preventDefault();
        }
    }
});

// Initialize on page load
window.onload = function() {
    console.log('StudentCitationTools.com v1.0 loaded');
    toggleFields(); // Set initial field visibility
    
    // Check for welcome message (first visit)
    if (!localStorage.getItem('visitedBefore')) {
        setTimeout(() => {
            showSuccess('Welcome to StudentCitationTools.com! Generate your first APA citation above.');
            localStorage.setItem('visitedBefore', 'true');
        }, 1000);
    }
};
