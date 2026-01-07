// StudentCitationTools.com - Production JavaScript
// Version: 1.0.0
// Last Updated: 2024-01-07

document.addEventListener('DOMContentLoaded', function() {
    console.log('StudentCitationTools.com loaded successfully');
    initializeApp();
    setCurrentYear();
});

// Initialize application
function initializeApp() {
    // Setup source type change listener
    document.getElementById('sourceType').addEventListener('change', toggleFields);
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Show welcome message for first-time visitors
    if (!localStorage.getItem('visitedBefore')) {
        setTimeout(showWelcomeMessage, 1000);
        localStorage.setItem('visitedBefore', 'true');
    }
}

// Toggle additional fields based on source type
function toggleFields() {
    const sourceType = document.getElementById('sourceType').value;
    const additionalFields = document.getElementById('additionalFields');
    
    if (sourceType === 'book') {
        additionalFields.innerHTML = `
            <div class="form-group" id="publisherField">
                <label>Publisher</label>
                <input type="text" id="publisher" placeholder="e.g., Oxford University Press">
            </div>
        `;
    } else if (sourceType === 'journal') {
        additionalFields.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Journal Name</label>
                    <input type="text" id="journal" placeholder="e.g., Journal of Psychology">
                </div>
                <div class="form-group">
                    <label>Volume & Issue</label>
                    <input type="text" id="volumeIssue" placeholder="e.g., 45(2)">
                </div>
            </div>
            <div class="form-group">
                <label>Page Range</label>
                <input type="text" id="pages" placeholder="e.g., 123-145">
            </div>
        `;
    } else {
        additionalFields.innerHTML = `
            <div class="form-group">
                <label>Website/Organization</label>
                <input type="text" id="website" placeholder="e.g., World Health Organization">
            </div>
        `;
    }
}

// Main citation generation function
function generateCitation() {
    try {
        // Get input values
        const author = document.getElementById('author').value.trim();
        const year = document.getElementById('year').value.trim();
        const title = document.getElementById('title').value.trim();
        const sourceType = document.getElementById('sourceType').value;
        const url = document.getElementById('url').value.trim();
        
        // Validate required fields
        if (!author || !year || !title) {
            showError('Please fill in all required fields (Author, Year, and Title)');
            return;
        }
        
        if (!/^\d{4}$/.test(year)) {
            showError('Please enter a valid 4-digit year (e.g., 2024)');
            return;
        }
        
        // Generate citation based on source type
        let citation;
        switch(sourceType) {
            case 'book':
                const publisher = document.getElementById('publisher')?.value.trim() || '';
                citation = generateBookCitation(author, year, title, publisher, url);
                break;
            case 'journal':
                const journal = document.getElementById('journal')?.value.trim() || '';
                const volumeIssue = document.getElementById('volumeIssue')?.value.trim() || '';
                const pages = document.getElementById('pages')?.value.trim() || '';
                citation = generateJournalCitation(author, year, title, journal, volumeIssue, pages, url);
                break;
            case 'website':
                const website = document.getElementById('website')?.value.trim() || '';
                citation = generateWebsiteCitation(author, year, title, website, url);
                break;
            default:
                citation = generateBookCitation(author, year, title, '', url);
        }
        
        // Display result
        displayCitation(citation);
        
        // Track usage
        trackEvent('citation_generated', sourceType);
        
    } catch (error) {
        console.error('Citation generation error:', error);
        showError('An error occurred. Please try again.');
    }
}

// Generate book citation
function generateBookCitation(author, year, title, publisher, url) {
    const formattedAuthors = formatAuthors(author);
    let citation = `${formattedAuthors} (${year}). `;
    
    // Format title (italicize, sentence case)
    citation += `<em>${formatTitle(title)}</em>.`;
    
    // Add publisher if provided
    if (publisher) {
        citation += ` ${publisher}.`;
    }
    
    // Add URL/DOI if provided
    if (url) {
        citation += ` ${formatURL(url)}`;
    }
    
    return citation;
}

// Generate journal citation
function generateJournalCitation(author, year, title, journal, volumeIssue, pages, url) {
    const formattedAuthors = formatAuthors(author);
    let citation = `${formattedAuthors} (${year}). `;
    
    // Article title (not italicized)
    citation += `${formatTitle(title, false)}. `;
    
    // Journal name (italicized)
    citation += `<em>${formatJournalName(journal)}</em>`;
    
    // Add volume/issue if provided
    if (volumeIssue) {
        citation += `, ${volumeIssue}`;
    }
    
    // Add page range if provided
    if (pages) {
        citation += `, ${pages}`;
    }
    
    citation += '.';
    
    // Add URL/DOI if provided
    if (url) {
        citation += ` ${formatURL(url)}`;
    }
    
    return citation;
}

// Generate website citation
function generateWebsiteCitation(author, year, title, website, url) {
    const formattedAuthors = formatAuthors(author);
    let citation = `${formattedAuthors} (${year}). `;
    
    // Article title
    citation += `<em>${formatTitle(title)}</em>. `;
    
    // Website/organization
    if (website) {
        citation += `${website}. `;
    }
    
    // URL
    if (url) {
        citation += `Retrieved from ${cleanURL(url)}`;
    } else {
        citation += 'Retrieved from [URL]';
    }
    
    return citation;
}

// Format author names according to APA style
function formatAuthors(authorString) {
    if (!authorString) return '';
    
    const authors = authorString.split(',').map(a => a.trim()).filter(a => a);
    const formattedAuthors = [];
    
    for (const author of authors) {
        const parts = author.split(' ').filter(p => p);
        if (parts.length === 0) continue;
        
        const lastName = parts[0];
        let initials = '';
        
        // Extract initials from first/middle names
        for (let i = 1; i < parts.length; i++) {
            if (parts[i]) {
                initials += parts[i].charAt(0).toUpperCase() + '. ';
            }
        }
        
        initials = initials.trim();
        
        if (lastName && initials) {
            formattedAuthors.push(`${lastName}, ${initials}`);
        } else {
            formattedAuthors.push(author);
        }
    }
    
    if (formattedAuthors.length === 0) return '';
    if (formattedAuthors.length === 1) return formattedAuthors[0];
    if (formattedAuthors.length === 2) {
        return `${formattedAuthors[0]} & ${formattedAuthors[1]}`;
    }
    
    // For 3+ authors
    return formattedAuthors.slice(0, -1).join(', ') + ', & ' + formattedAuthors[formattedAuthors.length - 1];
}

// Format title (sentence case for APA)
function formatTitle(title, italicize = true) {
    if (!title) return '';
    
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'with', 'in', 'of'];
    const words = title.toLowerCase().split(' ');
    
    const formatted = words.map((word, index) => {
        // Always capitalize first word
        if (index === 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        // Don't capitalize small words unless they're the last word
        if (smallWords.includes(word) && index !== words.length - 1) {
            return word;
        }
        // Capitalize all other words
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    
    let result = formatted.join(' ');
    
    // Add italics if needed
    if (italicize) {
        result = `<em>${result}</em>`;
    }
    
    return result;
}

// Format journal name
function formatJournalName(journal) {
    if (!journal) return '';
    
    // Capitalize major words in journal names
    const words = journal.split(' ');
    const majorWords = words.map(word => {
        if (word.length > 3) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.toLowerCase();
    });
    
    return majorWords.join(' ');
}

// Format URL/DOI
function formatURL(url) {
    if (!url) return '';
    
    // Check if it's a DOI
    if (url.includes('doi.org') || url.startsWith('10.')) {
        const doi = url.replace('https://doi.org/', '').replace('doi:', '');
        return `https://doi.org/${doi}`;
    }
    
    // Regular URL
    return url;
}

// Clean URL for display
function cleanURL(url) {
    if (!url) return '';
    
    // Remove protocol for cleaner display
    return url.replace(/^https?:\/\//, '');
}

// Display citation in result box
function displayCitation(citation) {
    const resultBox = document.getElementById('result');
    const plainCitation = citation.replace(/<[^>]*>/g, '');
    
    resultBox.innerHTML = `
        <div class="citation-output">
            <div class="citation-header">
                <span class="badge">APA 7th Edition</span>
                <small>Generated at ${new Date().toLocaleTimeString()}</small>
            </div>
            <div class="citation-content">${citation}</div>
            <div class="citation-footer">
                <small>Click "Copy" to use in your paper</small>
            </div>
        </div>
    `;
    
    // Store plain text version for copy/download
    resultBox.dataset.citation = plainCitation;
    
    // Show success message
    showSuccess('Citation generated successfully!');
}

// Copy citation to clipboard
function copyCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        showError('Please generate a citation first');
        return;
    }
    
    navigator.clipboard.writeText(citation)
        .then(() => {
            showSuccess('✅ Citation copied to clipboard!');
            
            // Visual feedback on button
            const copyBtn = document.getElementById('copyBtn');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="btn-icon">✅</span> Copied!';
            copyBtn.disabled = true;
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.disabled = false;
            }, 2000);
            
            trackEvent('citation_copied');
        })
        .catch(err => {
            console.error('Copy failed:', err);
            showError('Failed to copy. Please try again.');
        });
}

// Download citation as text file
function downloadCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        showError('Please generate a citation first');
        return;
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `APA_Citation_${timestamp}.txt`;
    const blob = new Blob([citation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('📥 Citation downloaded!');
    trackEvent('citation_downloaded');
}

// Share citation
function shareCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        showError('Please generate a citation first');
        return;
    }
    
    const shareText = `Generated using StudentCitationTools.com - Free APA Citation Generator\n\n${citation}\n\nTry it: https://studentcitationtools.com`;
    
    if (navigator.share) {
        navigator.share({
            title: 'APA Citation from StudentCitationTools.com',
            text: shareText,
            url: 'https://studentcitationtools.com'
        }).then(() => {
            trackEvent('citation_shared_mobile');
        }).catch(err => {
            // Fallback to clipboard
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(shareText) {
    navigator.clipboard.writeText(shareText)
        .then(() => {
            showSuccess('📋 Share link copied to clipboard!');
            trackEvent('citation_shared_clipboard');
        })
        .catch(err => {
            showError('Sharing failed. Please copy manually.');
        });
}

// Fill example data
function fillExample() {
    document.getElementById('author').value = 'Smith, John A., Johnson, Mary L.';
    document.getElementById('year').value = new Date().getFullYear().toString();
    document.getElementById('title').value = 'The Psychology of Modern Learning';
    document.getElementById('sourceType').value = 'book';
    
    // Trigger field update
    toggleFields();
    
    // Add publisher after fields are updated
    setTimeout(() => {
        const publisherField = document.getElementById('publisher');
        if (publisherField) {
            publisherField.value = 'Academic Press';
        }
        document.getElementById('url').value = 'https://doi.org/10.1000/example123';
        
        showSuccess('Example data filled. Click "Generate Citation" to see it in action!');
    }, 100);
    
    trackEvent('example_filled');
}

// Clear form
function clearForm() {
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('title').value = '';
    document.getElementById('url').value = '';
    
    const additionalFields = document.getElementById('additionalFields');
    additionalFields.innerHTML = `
        <div class="form-group" id="publisherField">
            <label>Publisher</label>
            <input type="text" id="publisher" placeholder="e.g., Oxford University Press">
        </div>
    `;
    
    const resultBox = document.getElementById('result');
    resultBox.innerHTML = `
        <div class="result-placeholder">
            <div class="placeholder-icon">📄</div>
            <p>Your citation will appear here</p>
        </div>
    `;
    delete resultBox.dataset.citation;
    
    document.getElementById('sourceType').value = 'book';
    
    showSuccess('Form cleared successfully!');
    trackEvent('form_cleared');
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `❌ ${message}`;
    
    // Remove existing error
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Insert after hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.parentNode.insertBefore(errorDiv, hero.nextSibling);
    } else {
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `✅ ${message}`;
    
    // Remove existing success
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();
    
    // Insert after hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.parentNode.insertBefore(successDiv, hero.nextSibling);
    } else {
        document.body.insertBefore(successDiv, document.body.firstChild);
    }
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Show welcome message
function showWelcomeMessage() {
    showSuccess('Welcome to StudentCitationTools.com! Generate your first APA citation above.');
}

// Initialize tooltips
function initializeTooltips() {
    // Add title attributes to form inputs
    const tooltips = {
        'author': 'Enter author(s) in format: Last Name, First Initial.',
        'year': '4-digit publication year',
        'title': 'Title of the work',
        'url': 'Enter DOI (preferred) or URL'
    };
    
    Object.keys(tooltips).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltips[id];
        }
    });
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateCitation();
        }
        
        // Escape to clear
        if (e.key === 'Escape') {
            clearForm();
        }
        
        // Ctrl/Cmd + D to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            copyCitation();
        }
    });
}

// Set current year in footer
function setCurrentYear() {
    const yearElements = document.querySelectorAll('.current-year');
    yearElements.forEach(el => {
        el.textContent = new Date().getFullYear();
    });
}

// Track events (for analytics)
function trackEvent(action, label = '') {
    // Log to console in development
    console.log(`[Analytics] ${action}${label ? ` - ${label}` : ''}`);
    
    // Store in localStorage for future analytics integration
    const events = JSON.parse(localStorage.getItem('tracking_events') || '[]');
    events.push({
        action,
        label,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent.substring(0, 100)
    });
    
    // Keep only last 100 events
    if (events.length > 100) {
        events.shift();
    }
    
    localStorage.setItem('tracking_events', JSON.stringify(events));
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateCitation,
        formatAuthors,
        formatTitle,
        formatURL
    };
}
