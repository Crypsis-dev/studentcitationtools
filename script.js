document.addEventListener('DOMContentLoaded', function() {
    console.log('StudentCitationTools.com loaded successfully');
    loadPreferences();
    initializeTooltips();
    
    // Auto-update Footer Year
    const footerP = document.querySelector('footer .footer-bottom p');
    if(footerP) {
        footerP.innerHTML = footerP.innerHTML.replace('2024', new Date().getFullYear());
    }
});

// --- Toggle Logic ---
function toggleFields() {
    const sourceType = document.getElementById('sourceType').value;
    const bookFields = document.getElementById('bookFields');
    const journalFields = document.getElementById('journalFields');
    const publisherLabel = document.querySelector('#bookFields label'); // To change label for Thesis
    
    // Reset visibility
    bookFields.classList.add('hidden');
    journalFields.classList.add('hidden');

    if (sourceType === 'book') {
        bookFields.classList.remove('hidden');
        if(publisherLabel) publisherLabel.innerText = "Publisher";
    } 
    else if (sourceType === 'journal') {
        journalFields.classList.remove('hidden');
    } 
    else if (sourceType === 'thesis') {
        // Thesis uses the "Publisher" field for "Institution"
        bookFields.classList.remove('hidden');
        if(publisherLabel) publisherLabel.innerText = "University / Institution";
    }
    // 'website' hides both specific blocks, only shows URL (which is always visible)
}

// --- Main Generator ---
function generateCitation() {
    const author = document.getElementById('author').value.trim();
    const year = document.getElementById('year').value.trim();
    const title = document.getElementById('title').value.trim();
    const sourceType = document.getElementById('sourceType').value;
    
    if (!author || !year || !title) {
        showError('Please fill in Author, Year, and Title.');
        return;
    }
    
    // Helper to format authors (Smith, J.)
    const formattedAuthors = formatAuthors(author);

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
    }
    
    displayCitation(citation);
    saveToHistory(citation);
}

// --- Specific Generators ---

function generateBookCitation(authors, year, title) {
    const publisher = document.getElementById('publisher').value.trim();
    const url = document.getElementById('url').value.trim();
    
    // APA 7th: Author (Year). Title. Publisher. URL
    let citation = `${authors} (${year}). <em>${formatTitle(title)}</em>. `;
    
    if (publisher) citation += `${publisher}.`;
    if (url) citation += addURLOrDOI(url);
    
    return citation;
}

function generateJournalCitation(authors, year, title) {
    const journal = document.getElementById('journalName').value.trim();
    const volume = document.getElementById('volume').value.trim();
    const issue = document.getElementById('issue').value.trim();
    const pages = document.getElementById('pages').value.trim();
    const url = document.getElementById('url').value.trim();
    
    // APA 7th: Author (Year). Title. Journal, Vol(Issue), Pages. DOI
    let citation = `${authors} (${year}). ${formatTitle(title, false)}. <em>${formatTitle(journal)}</em>`;
    
    if (volume) citation += `, <em>${volume}</em>`;
    if (issue) citation += `(${issue})`;
    if (pages) citation += `, ${pages}`;
    
    citation += `.`;
    if (url) citation += addURLOrDOI(url);
    
    return citation;
}

function generateWebsiteCitation(authors, year, title) {
    const url = document.getElementById('url').value.trim();
    // APA 7th: Author (Year). Title. Site Name. URL
    // We try to extract Site Name from URL
    let siteName = "";
    try { if(url) siteName = new URL(url).hostname.replace('www.',''); } catch(e){}

    let citation = `${authors} (${year}). <em>${formatTitle(title, false)}</em>. ${siteName}.`;
    
    if (!url) return "Error: Website citations require a URL.";
    citation += ` Retrieved from ${url}`;
    return citation;
}

function generateThesisCitation(authors, year, title) {
    const institution = document.getElementById('publisher').value.trim(); // Reusing publisher input
    const url = document.getElementById('url').value.trim();

    let citation = `${authors} (${year}). <em>${formatTitle(title)}</em> [Unpublished doctoral dissertation]. ${institution}.`;
    if(url) citation += ` ${url}`;
    return citation;
}

// --- Helpers ---

function formatAuthors(str) {
    // Simple formatter: Assumes user typed "Smith, J." correctly. 
    // In a V2, we can make this smarter.
    return str; 
}

function formatTitle(title, italic = true) {
    // APA sentence case is hard to code perfectly without a dictionary.
    // For now, we return the title as user typed it, or basic capitalization.
    return title; 
}

function addURLOrDOI(val) {
    if(val.includes('doi.org')) return ` https://doi.org/${val.split('doi.org/')[1]}`;
    if(val.startsWith('http')) return ` ${val}`;
    return ` https://doi.org/${val}`; // Assume it's a DOI number if no http
}

function displayCitation(html) {
    const resultBox = document.getElementById('result');
    resultBox.innerHTML = `<div class="citation-content">${html}</div>`;
    // Store plain text for copying
    resultBox.dataset.citation = resultBox.innerText;
}

function copyCitation() {
    const text = document.getElementById('result').dataset.citation;
    if(text) {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    } else {
        alert("Generate a citation first.");
    }
}

function downloadCitation() {
    const text = document.getElementById('result').dataset.citation;
    if(!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'citation.txt';
    a.click();
}

function shareCitation() {
    const text = document.getElementById('result').dataset.citation;
    if (navigator.share && text) {
        navigator.share({ title: 'APA Citation', text: text });
    } else {
        copyCitation(); // Fallback
    }
}

function fillExample() {
    document.getElementById('sourceType').value = 'book';
    toggleFields();
    document.getElementById('author').value = "Clear, J.";
    document.getElementById('year').value = "2018";
    document.getElementById('title').value = "Atomic Habits";
    document.getElementById('publisher').value = "Penguin Random House";
    document.getElementById('url').value = "";
}

function clearAll() {
    document.querySelectorAll('input').forEach(i => i.value = '');
    document.getElementById('result').innerHTML = '<p>Result cleared.</p>';
}

// Error/Success stubs
function showError(msg) { alert("❌ " + msg); }
function loadPreferences() {} 
function initializeTooltips() {}
function saveToHistory(c) {}
