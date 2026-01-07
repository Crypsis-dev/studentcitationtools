// Main function to generate APA citation
function generateCitation() {
    // Get input values
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('year').value.trim();
    const title = document.getElementById('title').value.trim();
    const publisher = document.getElementById('publisher').value.trim();
    const location = document.getElementById('location').value.trim();
    const url = document.getElementById('url').value.trim();
    
    // Validate required fields
    if (!author || !year || !title || !publisher) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }
    
    // Format authors
    const formattedAuthors = formatAuthors(author);
    
    // Build the citation
    let citation = formattedAuthors;
    
    // Add year
    citation += ` (${year}). `;
    
    // Add title in italics
    citation += `<em>${capitalizeTitle(title)}</em>. `;
    
    // Add location if provided
    if (location) {
        citation += `${location}: `;
    }
    
    // Add publisher
    citation += `${publisher}.`;
    
    // Add URL/DOI if provided
    if (url) {
        if (url.includes('doi.org')) {
            citation += ` https://doi.org/${url.split('doi.org/')[1]}`;
        } else {
            citation += ` Retrieved from ${url}`;
        }
    }
    
    // Display the citation
    const resultBox = document.getElementById('result');
    resultBox.innerHTML = `<strong>APA Citation:</strong>\n\n${citation}`;
    resultBox.style.color = '#2c3e50';
    
    // Store citation for copy/download
    resultBox.dataset.citation = citation;
}

// Format author names according to APA style
function formatAuthors(authorsString) {
    const authors = authorsString.split(',').map(author => author.trim());
    let formatted = [];
    
    authors.forEach(author => {
        const parts = author.split(' ');
        if (parts.length >= 2) {
            const lastName = parts[0];
            const initials = parts.slice(1).map(name => name.charAt(0) + '.').join(' ');
            formatted.push(`${lastName}, ${initials}`);
        } else {
            formatted.push(author);
        }
    });
    
    // APA format for multiple authors
    if (formatted.length === 0) {
        return '';
    } else if (formatted.length === 1) {
        return formatted[0];
    } else if (formatted.length === 2) {
        return `${formatted[0]} & ${formatted[1]}`;
    } else {
        return formatted.slice(0, -1).join(', ') + ', & ' + formatted[formatted.length - 1];
    }
}

// Capitalize title (APA style: sentence case)
function capitalizeTitle(title) {
    const words = title.toLowerCase().split(' ');
    const smallWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'with', 'in', 'of'];
    
    const capitalized = words.map((word, index) => {
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
    
    return capitalized.join(' ');
}

// Copy citation to clipboard
function copyCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        alert('Please generate a citation first');
        return;
    }
    
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = citation;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // Visual feedback
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    copyBtn.style.background = '#27ae60';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
    }, 2000);
}

// Download citation as .txt file
function downloadCitation() {
    const resultBox = document.getElementById('result');
    const citation = resultBox.dataset.citation;
    
    if (!citation) {
        alert('Please generate a citation first');
        return;
    }
    
    const blob = new Blob([citation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apa_citation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Visual feedback
    const downloadBtn = document.querySelector('.download-btn');
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = '✓ Downloaded!';
    downloadBtn.style.background = '#8e44ad';
    
    setTimeout(() => {
        downloadBtn.textContent = originalText;
        downloadBtn.style.background = '';
    }, 2000);
}

// Clear all inputs
function clearAll() {
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('title').value = '';
    document.getElementById('publisher').value = '';
    document.getElementById('location').value = '';
    document.getElementById('url').value = '';
    
    const resultBox = document.getElementById('result');
    resultBox.innerHTML = '<p class="placeholder">Your citation will appear here...</p>';
    resultBox.style.color = '#bdc3c7';
    delete resultBox.dataset.citation;
}

// Auto-fill example (for testing)
function fillExample() {
    document.getElementById('author').value = 'Smith, John A., Johnson, Mary';
    document.getElementById('year').value = '2023';
    document.getElementById('title').value = 'The Psychology of Learning and Memory';
    document.getElementById('publisher').value = 'Academic Press';
    document.getElementById('location').value = 'New York, NY';
}

// Optional: Add this to index.html for easy testing
// <button onclick="fillExample()" style="background: #f39c12; color: white; margin-top: 10px;">Fill Example</button>

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        generateCitation();
    }
    // Escape to clear
    if (e.key === 'Escape') {
        clearAll();
    }
});
