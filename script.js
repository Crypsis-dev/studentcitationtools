// Citation Generator - Complete Solution with ISBN Lookup
class CitationGenerator {
    constructor() {
        this.currentStyle = 'apa';
        this.currentSourceType = 'book';
        this.citationHistory = [];
        this.premiumUser = false;
        this.adEnabled = true;
    }

    // Main initialization
    init() {
        console.log('Initializing Enhanced Citation Generator...');
        
        // Initialize all modules
        this.initMobileMenu();
        this.initTabs();
        this.initForm();
        this.initISBNLookup();
        this.initCitationHistory();
        this.initPremiumFeatures();
        this.initAnalytics();
        this.initServiceWorker();
        this.checkURLParameters();
        
        console.log('Citation Generator initialized successfully!');
    }

    // ======================
    // MOBILE MENU FUNCTIONS
    // ======================
    initMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mainNav = document.getElementById('mainNav');
        
        if (!mobileMenuBtn || !mainNav) {
            console.warn('Mobile menu elements not found');
            return;
        }
        
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = mainNav.classList.contains('active');
            isActive ? this.closeMobileMenu() : this.openMobileMenu();
        });
        
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('active') && 
                !mainNav.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
        
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
                this.closeMobileMenu();
            }
        });
    }

    openMobileMenu() {
        const mainNav = document.getElementById('mainNav');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        mainNav.classList.add('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        mobileMenuBtn.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
        
        this.trackEvent('mobile_menu', 'open');
    }

    closeMobileMenu() {
        const mainNav = document.getElementById('mainNav');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        mainNav.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        
        this.trackEvent('mobile_menu', 'close');
    }

    // ======================
    // TAB FUNCTIONS
    // ======================
    initTabs() {
        const tabs = document.querySelectorAll('.style-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const style = tab.dataset.style;
                if (style) {
                    this.switchStyle(style);
                }
            });
        });
        
        // Check for saved preference
        const savedStyle = localStorage.getItem('preferredCitationStyle');
        if (savedStyle && ['apa', 'mla', 'chicago'].includes(savedStyle)) {
            this.switchStyle(savedStyle);
        }
    }

    switchStyle(style) {
        if (!['apa', 'mla', 'chicago'].includes(style)) {
            console.error('Invalid style:', style);
            return;
        }
        
        this.currentStyle = style;
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
            'apa': '<i class="fas fa-tag"></i> APA 7th',
            'mla': '<i class="fas fa-tag"></i> MLA 9th',
            'chicago': '<i class="fas fa-tag"></i> Chicago 17th'
        };
        const styleBadge = document.getElementById('styleBadge');
        if (styleBadge) {
            styleBadge.innerHTML = badgeMap[style] || '<i class="fas fa-tag"></i> APA 7th';
        }
        
        // Update style info
        this.updateStyleInfo(style);
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('style', style);
        window.history.replaceState({}, '', url);
        
        this.trackEvent('citation_style', 'switch', style);
        
        // Regenerate citation if form has data
        if (document.getElementById('author')?.value.trim()) {
            setTimeout(() => this.generateCitation(), 100);
        }
    }

    updateStyleInfo(style) {
        const infoMap = {
            'apa': '<p><strong>APA 7th Edition:</strong> Used in psychology, education, and social sciences. Requires author, date, title, source, and DOI/URL when available.</p>',
            'mla': '<p><strong>MLA 9th Edition:</strong> Used in humanities, literature, and arts. Requires author, title, container, publisher, date, and location.</p>',
            'chicago': '<p><strong>Chicago 17th Edition:</strong> Used in publishing, history, and some social sciences. Has two systems: notes-bibliography and author-date.</p>'
        };
        
        const styleInfo = document.getElementById('styleInfo');
        if (styleInfo) {
            styleInfo.innerHTML = `<div class="info-box">${infoMap[style] || infoMap.apa}</div>`;
        }
    }

    // ======================
    // FORM FUNCTIONS
    // ======================
    initForm() {
        const sourceTypeSelect = document.getElementById('sourceType');
        if (sourceTypeSelect) {
            sourceTypeSelect.addEventListener('change', (e) => {
                this.currentSourceType = e.target.value;
                this.updateFormFields();
            });
        }
        
        // Form validation
        const requiredInputs = document.querySelectorAll('input[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
        });
        
        // Enter key to generate citation
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) {
                e.preventDefault();
                this.generateCitation();
            }
        });
        
        // Auto-save form data
        setInterval(() => this.saveFormData(), 5000);
        
        // Load saved form data
        this.loadFormData();
    }

    updateFormFields() {
        const fields = {
            publisher: ['book', 'thesis', 'conference', 'video'],
            journal: ['journal'],
            volume: ['journal', 'magazine'],
            issue: ['journal', 'magazine'],
            pages: ['journal', 'magazine', 'newspaper', 'conference']
        };
        
        for (const [field, types] of Object.entries(fields)) {
            const fieldElement = document.getElementById(field + 'Field');
            if (fieldElement) {
                fieldElement.style.display = types.includes(this.currentSourceType) ? 'block' : 'none';
            }
        }
    }

    validateField(field) {
        if (field.required && !field.value.trim()) {
            field.classList.add('invalid');
            this.showAlert(`Please fill in ${field.previousElementSibling?.textContent || 'this field'}`, 'error');
            return false;
        }
        field.classList.remove('invalid');
        return true;
    }

    saveFormData() {
        try {
            const formData = {
                author: document.getElementById('author')?.value || '',
                year: document.getElementById('year')?.value || '',
                title: document.getElementById('title')?.value || '',
                publisher: document.getElementById('publisher')?.value || '',
                url: document.getElementById('url')?.value || '',
                isbn: document.getElementById('isbn')?.value || '',
                style: this.currentStyle,
                sourceType: this.currentSourceType
            };
            localStorage.setItem('citationFormData', JSON.stringify(formData));
        } catch (e) {
            console.error('Failed to save form data:', e);
        }
    }

    loadFormData() {
        try {
            const saved = localStorage.getItem('citationFormData');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.style) this.switchStyle(data.style);
                if (data.sourceType) {
                    document.getElementById('sourceType').value = data.sourceType;
                    this.currentSourceType = data.sourceType;
                    this.updateFormFields();
                }
                
                setTimeout(() => {
                    if (data.author) document.getElementById('author').value = data.author;
                    if (data.year) document.getElementById('year').value = data.year;
                    if (data.title) document.getElementById('title').value = data.title;
                    if (data.publisher) document.getElementById('publisher').value = data.publisher;
                    if (data.url) document.getElementById('url').value = data.url;
                    if (data.isbn) document.getElementById('isbn').value = data.isbn;
                }, 100);
            }
        } catch (e) {
            console.error('Failed to load form data:', e);
        }
    }

    // ======================
    // ISBN LOOKUP FUNCTIONS
    // ======================
    initISBNLookup() {
        const isbnInput = document.getElementById('isbnInput');
        if (isbnInput) {
            isbnInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.fetchByISBN();
                }
            });
        }
    }

    async fetchByISBN() {
        const isbnInput = document.getElementById('isbnInput');
        const isbnResult = document.getElementById('isbnResult');
        
        if (!isbnInput || !isbnResult) return;
        
        const isbn = isbnInput.value.trim();
        
        if (!isbn) {
            this.showAlert('Please enter an ISBN number', 'error');
            return;
        }
        
        // Validate ISBN format
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (!/^(?:\d{10}|\d{13})$/.test(cleanISBN)) {
            this.showAlert('Please enter a valid ISBN-10 or ISBN-13 number', 'error');
            return;
        }
        
        // Show loading state
        isbnResult.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching for book details...</p>
            </div>
        `;
        
        try {
            const bookData = await this.fetchBookData(cleanISBN);
            
            if (bookData) {
                this.populateFormWithBookData(bookData);
                
                isbnResult.innerHTML = `
                    <div class="success">
                        <div class="book-info">
                            <div class="book-cover">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="book-details">
                                <h5>${bookData.title || 'Unknown Title'}</h5>
                                <p><strong>Author:</strong> ${bookData.author || 'Unknown'}</p>
                                <p><strong>Publisher:</strong> ${bookData.publisher || 'Unknown'}</p>
                                <p><strong>Year:</strong> ${bookData.year || 'Unknown'}</p>
                                <p><strong>ISBN:</strong> ${this.formatISBN(cleanISBN)}</p>
                            </div>
                        </div>
                        <button class="btn btn-small" onclick="citationGenerator.useThisBook()">
                            <i class="fas fa-check"></i> Use This Book
                        </button>
                    </div>
                `;
                
                this.showAlert('Book details loaded successfully!', 'success');
                this.trackEvent('isbn_lookup', 'success', cleanISBN);
            } else {
                throw new Error('Book not found');
            }
        } catch (error) {
            console.error('ISBN lookup error:', error);
            isbnResult.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to find book details for this ISBN.</p>
                    <p>Please try manual entry or check the ISBN.</p>
                </div>
            `;
            this.trackEvent('isbn_lookup', 'error', cleanISBN);
        }
    }

    async fetchBookData(isbn) {
        // Try Open Library API first
        try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
            if (response.ok) {
                const data = await response.json();
                const bookKey = `ISBN:${isbn}`;
                
                if (data[bookKey]) {
                    const book = data[bookKey];
                    return {
                        title: book.title,
                        author: book.authors ? book.authors.map(a => a.name).join(', ') : '',
                        publisher: book.publishers ? book.publishers[0].name : '',
                        year: book.publish_date ? new Date(book.publish_date).getFullYear() : '',
                        isbn: isbn
                    };
                }
            }
        } catch (error) {
            console.log('Open Library API failed, trying Google Books');
        }
        
        // Fallback to Google Books API
        try {
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    const book = data.items[0].volumeInfo;
                    return {
                        title: book.title,
                        author: book.authors ? book.authors.join(', ') : '',
                        publisher: book.publisher || '',
                        year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : '',
                        isbn: isbn
                    };
                }
            }
        } catch (error) {
            console.log('Google Books API failed');
        }
        
        return null;
    }

    populateFormWithBookData(bookData) {
        document.getElementById('author').value = bookData.author || '';
        document.getElementById('year').value = bookData.year || '';
        document.getElementById('title').value = bookData.title || '';
        document.getElementById('publisher').value = bookData.publisher || '';
        document.getElementById('isbn').value = this.formatISBN(bookData.isbn) || '';
        
        // Set source type to book
        document.getElementById('sourceType').value = 'book';
        this.currentSourceType = 'book';
        this.updateFormFields();
    }

    formatISBN(isbn) {
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        if (cleanISBN.length === 10) {
            return `${cleanISBN.substring(0, 1)}-${cleanISBN.substring(1, 4)}-${cleanISBN.substring(4, 9)}-${cleanISBN.substring(9)}`;
        } else if (cleanISBN.length === 13) {
            return `${cleanISBN.substring(0, 3)}-${cleanISBN.substring(3, 4)}-${cleanISBN.substring(4, 6)}-${cleanISBN.substring(6, 12)}-${cleanISBN.substring(12)}`;
        }
        return isbn;
    }

    useThisBook() {
        this.generateCitation();
    }

    clearISBN() {
        const isbnInput = document.getElementById('isbnInput');
        const isbnResult = document.getElementById('isbnResult');
        if (isbnInput) isbnInput.value = '';
        if (isbnResult) isbnResult.innerHTML = '';
    }

    // ======================
    // CITATION GENERATION
    // ======================
    generateCitation() {
        console.log('Generating citation for style:', this.currentStyle);
        
        // Get form values
        const author = document.getElementById('author')?.value.trim() || '';
        const year = document.getElementById('year')?.value.trim() || '';
        const title = document.getElementById('title')?.value.trim() || '';
        
        // Validation
        if (!author || !year || !title) {
            this.showAlert('Please fill in all required fields (Author, Year, Title)', 'error');
            return;
        }
        
        if (year && (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 1)) {
            this.showAlert(`Please enter a valid publication year (1000-${new Date().getFullYear() + 1})`, 'error');
            return;
        }
        
        // Get additional form values
        const publisher = document.getElementById('publisher')?.value.trim() || '';
        const journal = document.getElementById('journal')?.value.trim() || '';
        const volume = document.getElementById('volume')?.value.trim() || '';
        const issue = document.getElementById('issue')?.value.trim() || '';
        const pages = document.getElementById('pages')?.value.trim() || '';
        const url = document.getElementById('url')?.value.trim() || '';
        const isbn = document.getElementById('isbn')?.value.trim() || '';
        
        // Generate citation based on style
        let citation = '';
        try {
            const citationData = { author, year, title, publisher, journal, volume, issue, pages, url, isbn };
            
            switch(this.currentStyle) {
                case 'apa':
                    citation = this.generateAPACitation(citationData);
                    break;
                case 'mla':
                    citation = this.generateMLACitation(citationData);
                    break;
                case 'chicago':
                    citation = this.generateChicagoCitation(citationData);
                    break;
                default:
                    citation = this.generateAPACitation(citationData);
            }
            
            // Display result
            const resultElement = document.getElementById('result');
            if (resultElement) {
                resultElement.innerHTML = `<pre>${citation}</pre>`;
            }
            
            // Save to history
            this.saveCitationToHistory(citation);
            
            // Show success message
            this.showAlert('Citation generated successfully!', 'success');
            
            // Track generation
            this.trackEvent('citation', 'generate', this.currentStyle);
            
        } catch (error) {
            console.error('Citation generation error:', error);
            this.showAlert('Error generating citation. Please check your input.', 'error');
        }
    }

    generateAPACitation(data) {
        let citation = '';
        
        // Format author(s)
        let authors = data.author;
        if (authors.includes(',')) {
            const authorList = authors.split(',').map(a => a.trim());
            if (authorList.length === 1) {
                authors = authorList[0];
            } else if (authorList.length === 2) {
                authors = `${authorList[0]} & ${authorList[1]}`;
            } else {
                authors = `${authorList.slice(0, -1).join(', ')}, & ${authorList[authorList.length - 1]}`;
            }
        }
        
        // Start building citation
        citation += `${authors}. (${data.year}). `;
        
        // Add title with proper formatting
        if (this.currentSourceType === 'book') {
            citation += `<i>${data.title}.</i> `;
            if (data.publisher) citation += `${data.publisher}.`;
        } else if (this.currentSourceType === 'journal') {
            citation += `${data.title}. `;
            if (data.journal) {
                citation += `<i>${data.journal}</i>`;
                if (data.volume) {
                    citation += `, <i>${data.volume}</i>`;
                    if (data.issue) citation += `(${data.issue})`;
                }
                if (data.pages) citation += `, ${data.pages}.`;
            }
        } else {
            citation += `${data.title}.`;
            if (data.publisher) citation += ` ${data.publisher}.`;
        }
        
        // Add DOI or URL if available
        if (data.url) {
            if (data.url.includes('doi.org') || data.url.includes('doi:')) {
                citation += ` ${data.url}`;
            } else {
                citation += ` Retrieved from ${data.url}`;
            }
        }
        
        return citation;
    }

    generateMLACitation(data) {
        let citation = '';
        citation += `${data.author}. `;
        citation += `"${data.title}." `;
        
        if (this.currentSourceType === 'book') {
            citation += `${data.publisher}, ${data.year}.`;
        } else if (this.currentSourceType === 'journal') {
            if (data.journal) citation += `<i>${data.journal}</i>, `;
            if (data.volume) citation += `vol. ${data.volume}, `;
            if (data.issue) citation += `no. ${data.issue}, `;
            citation += `${data.year}, `;
            if (data.pages) citation += `pp. ${data.pages}.`;
        }
        
        if (data.url) citation += ` ${data.url}.`;
        
        return citation;
    }

    generateChicagoCitation(data) {
        let citation = '';
        citation += `${data.author}. ${data.year}. <i>${data.title}.</i> `;
        
        if (this.currentSourceType === 'book') {
            if (data.publisher) citation += `${data.publisher}.`;
        } else if (this.currentSourceType === 'journal') {
            if (data.journal) citation += `<i>${data.journal}</i> `;
            if (data.volume) citation += `${data.volume}`;
            if (data.issue) citation += `, no. ${data.issue}`;
            if (data.pages) citation += `: ${data.pages}.`;
        }
        
        if (data.url) citation += ` ${data.url}.`;
        
        return citation;
    }

    // ======================
    // EXAMPLE & UTILITY FUNCTIONS
    // ======================
    fillExample() {
        const examples = {
            apa: {
                author: 'Smith, John A., Johnson, Mary B., & Williams, Robert C.',
                year: '2023',
                title: 'The Psychology of Modern Learning: A Comprehensive Guide',
                publisher: 'Academic Press',
                journal: 'Journal of Educational Psychology',
                volume: '45',
                issue: '3',
                pages: '123-145',
                url: 'https://doi.org/10.1037/edu0000456',
                isbn: '978-1-234-56789-0'
            },
            mla: {
                author: 'Smith, John A., and Mary B. Johnson',
                year: '2023',
                title: 'Modern Literary Criticism: An Anthology',
                publisher: 'Penguin Books',
                journal: 'Modern Literature Quarterly',
                volume: '32',
                issue: '2',
                pages: '45-67',
                url: 'https://www.example.com/article',
                isbn: '978-0-123-45678-9'
            },
            chicago: {
                author: 'Smith, John A., Mary B. Johnson, and Robert C. Williams',
                year: '2023',
                title: 'Historical Perspectives on Urban Development',
                publisher: 'University of Chicago Press',
                journal: 'Journal of Urban History',
                volume: '49',
                issue: '1',
                pages: '89-112',
                url: 'https://www.jstor.org/stable/123456',
                isbn: '978-0-226-12345-6'
            }
        };
        
        const example = examples[this.currentStyle] || examples.apa;
        
        document.getElementById('author').value = example.author;
        document.getElementById('year').value = example.year;
        document.getElementById('title').value = example.title;
        document.getElementById('publisher').value = example.publisher;
        document.getElementById('journal').value = example.journal || '';
        document.getElementById('volume').value = example.volume || '';
        document.getElementById('issue').value = example.issue || '';
        document.getElementById('pages').value = example.pages || '';
        document.getElementById('url').value = example.url || '';
        document.getElementById('isbn').value = example.isbn || '';
        
        this.showAlert('Example data loaded. Click "Generate Citation" to see result.', 'info');
        this.trackEvent('example', 'load', this.currentStyle);
    }

    clearForm() {
        // Clear all form fields
        const fields = ['author', 'year', 'title', 'publisher', 'journal', 'volume', 'issue', 'pages', 'url', 'isbn'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) element.value = '';
        });
        
        // Reset result area
        const result = document.getElementById('result');
        if (result) {
            result.innerHTML = `
                <div class="result-placeholder">
                    <div class="placeholder-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <p>Select a style and fill the form to generate citation</p>
                    <p class="placeholder-sub">Or use the ISBN lookup for automatic filling</p>
                </div>
            `;
        }
        
        // Clear saved form data
        localStorage.removeItem('citationFormData');
        
        this.showAlert('Form cleared successfully.', 'info');
        this.trackEvent('form', 'clear');
    }

    copyCitation() {
        const result = document.getElementById('result');
        if (!result) return;
        
        const text = result.textContent;
        if (!text || text.includes('Select a style')) {
            this.showAlert('No citation to copy. Please generate a citation first.', 'error');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            if (copyBtn) {
                const originalHTML = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }
            
            this.showAlert('Citation copied to clipboard!', 'success');
            this.trackEvent('citation', 'copy');
            
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showAlert('Failed to copy citation. Please try again.', 'error');
        });
    }

    downloadCitation() {
        const result = document.getElementById('result');
        if (!result) return;
        
        const text = result.textContent;
        if (!text || text.includes('Select a style')) {
            this.showAlert('No citation to download. Please generate a citation first.', 'error');
            return;
        }
        
        try {
            const style = this.currentStyle;
            const sourceType = this.currentSourceType;
            const filename = `citation_${style}_${sourceType}_${Date.now()}.txt`;
            
            const blob = new Blob([text], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showAlert('Citation downloaded successfully!', 'success');
            this.trackEvent('citation', 'download');
            
        } catch (error) {
            console.error('Download error:', error);
            this.showAlert('Failed to download citation.', 'error');
        }
    }

    exportAs(format) {
        const result = document.getElementById('result');
        if (!result) return;
        
        const text = result.textContent;
        if (!text || text.includes('Select a style')) {
            this.showAlert('No citation to export. Please generate a citation first.', 'error');
            return;
        }
        
        // Premium feature check
        if (!this.premiumUser && format !== 'txt') {
            this.showAlert(`${format.toUpperCase()} export is a premium feature. Upgrade to unlock!`, 'info');
            this.trackEvent('export', 'premium_required', format);
            return;
        }
        
        // Handle different export formats
        switch(format) {
            case 'txt':
                this.downloadCitation();
                break;
            case 'doc':
                this.exportToDoc(text);
                break;
            case 'pdf':
                this.exportToPDF(text);
                break;
            case 'bibtex':
                this.exportToBibTeX(text);
                break;
        }
    }

    exportToDoc(text) {
        // Create Word document
        const blob = new Blob([`
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:w="urn:schemas-microsoft-com:office:word" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="utf-8">
                <title>Citation Export</title>
            </head>
            <body>
                <pre>${text}</pre>
            </body>
            </html>
        `], { type: 'application/msword' });
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `citation_${this.currentStyle}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.trackEvent('export', 'doc');
    }

    exportToPDF(text) {
        // Simple PDF export (in production, use a proper PDF library)
        this.showAlert('PDF export would be implemented with a proper PDF library.', 'info');
        this.trackEvent('export', 'pdf');
    }

    exportToBibTeX(text) {
        // Convert to BibTeX format
        const bibtex = `@book{citation_${Date.now()},
    author = {${document.getElementById('author').value}},
    title = {${document.getElementById('title').value}},
    year = {${document.getElementById('year').value}},
    publisher = {${document.getElementById('publisher').value || 'Unknown'}},
    isbn = {${document.getElementById('isbn').value || ''}}
}`;
        
        const blob = new Blob([bibtex], { type: 'application/x-bibtex' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `citation_${this.currentStyle}.bib`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.trackEvent('export', 'bibtex');
    }

    saveCitation() {
        const result = document.getElementById('result');
        if (!result) return;
        
        const text = result.textContent;
        if (!text || text.includes('Select a style')) {
            this.showAlert('No citation to save. Please generate a citation first.', 'error');
            return;
        }
        
        // Premium feature check
        if (!this.premiumUser) {
            this.showAlert('Save feature is premium. Upgrade to unlock!', 'info');
            this.trackEvent('save', 'premium_required');
            return;
        }
        
        // Save to cloud (simulated)
        this.showAlert('Citation saved to cloud!', 'success');
        this.trackEvent('citation', 'save');
    }

    // ======================
    // CITATION HISTORY
    // ======================
    initCitationHistory() {
        this.loadCitationHistory();
    }

    saveCitationToHistory(citation) {
        try {
            const history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
            
            history.unshift({
                id: Date.now(),
                citation: citation.substring(0, 100) + (citation.length > 100 ? '...' : ''),
                fullCitation: citation,
                style: this.currentStyle,
                sourceType: this.currentSourceType,
                date: new Date().toLocaleDateString()
            });
            
            // Keep only last 10 items for free users, 50 for premium
            const maxHistory = this.premiumUser ? 50 : 10;
            if (history.length > maxHistory) {
                history.length = maxHistory;
            }
            
            localStorage.setItem('citationHistory', JSON.stringify(history));
            this.citationHistory = history;
            
            // Update history display
            this.displayCitationHistory();
            
        } catch (e) {
            console.error('Failed to save citation history:', e);
        }
    }

    loadCitationHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
            this.citationHistory = history;
            this.displayCitationHistory();
        } catch (e) {
            console.error('Failed to load citation history:', e);
        }
    }

    displayCitationHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.citationHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No recent citations. Generate one to see it here.</p>';
            return;
        }
        
        let html = '';
        this.citationHistory.forEach(item => {
            html += `
                <div class="history-item">
                    <div class="history-item-content">
                        <div class="history-citation">${item.citation}</div>
                        <div class="history-meta">
                            <span class="history-style">${item.style.toUpperCase()}</span>
                            <span class="history-date">${item.date}</span>
                        </div>
                    </div>
                    <button class="btn-history-action" onclick="citationGenerator.loadHistoryItem(${item.id})" title="Load this citation">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            `;
        });
        
        historyList.innerHTML = html;
    }

    loadHistoryItem(id) {
        const item = this.citationHistory.find(h => h.id === id);
        
        if (item) {
            const result = document.getElementById('result');
            if (result) {
                result.innerHTML = `<pre>${item.fullCitation}</pre>`;
            }
            this.showAlert('Citation loaded from history', 'success');
            this.trackEvent('history', 'load', item.style);
        }
    }

    // ======================
    // PREMIUM FEATURES
    // ======================
    initPremiumFeatures() {
        // Check if user has premium
        const premiumStatus = localStorage.getItem('premiumUser');
        this.premiumUser = premiumStatus === 'true';
        
        // Update UI based on premium status
        this.updatePremiumUI();
        
        // Initialize premium features
        this.initFAQToggle();
        this.initThemeToggle();
    }

    updatePremiumUI() {
        const premiumElements = document.querySelectorAll('.premium-feature');
        premiumElements.forEach(el => {
            if (!this.premiumUser) {
                el.classList.add('locked');
                el.setAttribute('title', 'Premium feature - Upgrade to unlock');
            } else {
                el.classList.remove('locked');
                el.removeAttribute('title');
            }
        });
        
        // Update premium indicator
        const premiumIndicator = document.querySelector('.premium-indicator');
        if (premiumIndicator) {
            premiumIndicator.style.display = this.premiumUser ? 'block' : 'none';
        }
    }

    enablePremium() {
        // In a real application, this would involve payment processing
        // For demo purposes, we'll just set the flag
        this.premiumUser = true;
        localStorage.setItem('premiumUser', 'true');
        
        // Update UI
        this.updatePremiumUI();
        
        // Show success message
        this.showAlert('Premium features unlocked! Thank you for upgrading.', 'success');
        this.trackEvent('premium', 'enabled');
        
        // Reload history with increased limit
        this.loadCitationHistory();
    }

    initFAQToggle() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const faqItem = this.parentElement;
                const answer = this.nextElementSibling;
                const icon = this.querySelector('.fa-chevron-down');
                
                // Toggle active class
                faqItem.classList.toggle('active');
                
                // Toggle icon
                if (faqItem.classList.contains('active')) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });
        });
    }

    initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                
                // Update icon
                const icon = themeToggle.querySelector('i');
                if (document.body.classList.contains('dark-mode')) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                    localStorage.setItem('theme', 'dark');
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                    localStorage.setItem('theme', 'light');
                }
                
                this.trackEvent('theme', 'toggle', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
            
            // Load saved theme
            this.loadThemePreference();
        }
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        const themeToggle = document.getElementById('themeToggle');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) {
                themeToggle.querySelector('i').classList.remove('fa-moon');
                themeToggle.querySelector('i').classList.add('fa-sun');
            }
        }
    }

    enableAds() {
        this.adEnabled = true;
        localStorage.setItem('adsEnabled', 'true');
        this.showAlert('Ads enabled. Thank you for supporting our free service!', 'success');
        this.trackEvent('ads', 'enabled');
    }

    disableAds() {
        if (!this.premiumUser) {
            this.showAlert('Ad-free experience is a premium feature. Upgrade to remove ads.', 'info');
            return;
        }
        
        this.adEnabled = false;
        localStorage.setItem('adsEnabled', 'false');
        this.showAlert('Ads disabled. Enjoy your ad-free experience!', 'success');
        this.trackEvent('ads', 'disabled');
    }

    // ======================
    // ANALYTICS FUNCTIONS
    // ======================
    initAnalytics() {
        // Track page view
        this.trackPageView();
        
        // Track interactions
        this.trackInteractions();
        
        // Track errors
        window.addEventListener('error', (e) => {
            this.trackEvent('error', 'javascript', e.message, 1);
        });
        
        // Track performance
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                this.trackEvent('performance', 'page_load', loadTime.toString(), 1);
            });
        }
    }

    trackPageView() {
        if (typeof gtag === 'function') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }

    trackEvent(category, action, label = null, value = null) {
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

    trackInteractions() {
        // Track button clicks
        document.querySelectorAll('.btn, .style-tab, .mobile-menu-btn').forEach(button => {
            button.addEventListener('click', function() {
                const text = this.textContent.trim() || this.getAttribute('aria-label') || 'button';
                citationGenerator.trackEvent('ui', 'click', text);
            });
        });
        
        // Track form field interactions
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('focus', function() {
                citationGenerator.trackEvent('form', 'focus', this.name || this.id);
            });
        });
    }

    // ======================
    // HELPER FUNCTIONS
    // ======================
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.notification');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // ======================
    // SERVICE WORKER
    // ======================
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered:', reg))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }

    // ======================
    // URL PARAMETERS
    // ======================
    checkURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const style = urlParams.get('style');
        const isbn = urlParams.get('isbn');
        
        if (style && ['apa', 'mla', 'chicago'].includes(style)) {
            this.switchStyle(style);
        }
        
        if (isbn) {
            document.getElementById('isbnInput').value = isbn;
            setTimeout(() => this.fetchByISBN(), 1000);
        }
    }
}

// Initialize the citation generator
const citationGenerator = new CitationGenerator();

// Make functions available globally
window.citationGenerator = citationGenerator;
window.generateCitation = () => citationGenerator.generateCitation();
window.fillExample = () => citationGenerator.fillExample();
window.clearForm = () => citationGenerator.clearForm();
window.copyCitation = () => citationGenerator.copyCitation();
window.downloadCitation = () => citationGenerator.downloadCitation();
window.exportAs = (format) => citationGenerator.exportAs(format);
window.saveCitation = () => citationGenerator.saveCitation();
window.fetchByISBN = () => citationGenerator.fetchByISBN();
window.clearISBN = () => citationGenerator.clearISBN();
window.useThisBook = () => citationGenerator.useThisBook();
window.enableAds = () => citationGenerator.enableAds();
window.enablePremium = () => citationGenerator.enablePremium();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => citationGenerator.init());
} else {
    citationGenerator.init();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        citationGenerator.generateCitation();
    }
    
    // Ctrl/Cmd + E for example
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        citationGenerator.fillExample();
    }
    
    // Ctrl/Cmd + C to copy (only when not in input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && 
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        citationGenerator.copyCitation();
    }
    
    // Ctrl/Cmd + L for ISBN lookup
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        document.getElementById('isbnInput')?.focus();
    }
});

console.log('Enhanced Citation Generator script loaded successfully');
