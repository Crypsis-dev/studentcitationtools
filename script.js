// Citation Generator - Complete Solution with ISBN Lookup
class CitationGenerator {
    constructor() {
        this.currentStyle = 'apa';
        this.currentSourceType = 'book';
        this.citationHistory = [];
        this.premiumUser = false;
        this.adEnabled = true;
        this.init();
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
        const navOverlay = document.getElementById('navOverlay');
        const navClose = document.getElementById('navClose');
        
        if (!mobileMenuBtn || !mainNav) {
            console.warn('Mobile menu elements not found');
            return;
        }
        
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });
        
        if (navClose) {
            navClose.addEventListener('click', () => this.closeMobileMenu());
        }
        
        if (navOverlay) {
            navOverlay.addEventListener('click', () => this.closeMobileMenu());
        }
        
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
        
        // Close menu when clicking navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
    }

    toggleMobileMenu() {
        const mainNav = document.getElementById('mainNav');
        const navOverlay = document.getElementById('navOverlay');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (mainNav.classList.contains('active')) {
            this.closeMobileMenu();
        } else {
            mainNav.classList.add('active');
            navOverlay.classList.add('active');
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            mobileMenuBtn.setAttribute('aria-label', 'Close menu');
            document.body.style.overflow = 'hidden';
            this.trackEvent('mobile_menu', 'open');
        }
    }

    closeMobileMenu() {
        const mainNav = document.getElementById('mainNav');
        const navOverlay = document.getElementById('navOverlay');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        mainNav.classList.remove('active');
        navOverlay.classList.remove('active');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileMenuBtn.setAttribute('aria-label', 'Open menu');
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
        
        // Initialize with APA if no style selected
        if (!this.currentStyle) {
            this.switchStyle('apa');
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
        
        // Update form to show style info
        const styleInput = document.getElementById('style');
        if (styleInput) {
            styleInput.value = style;
        }
        
        this.trackEvent('citation_style', 'switch', style);
        
        // Regenerate citation if form has data
        if (document.getElementById('author')?.value.trim()) {
            setTimeout(() => this.generateCitation(), 100);
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
            
            // Set initial source type
            this.currentSourceType = sourceTypeSelect.value;
        }
        
        // Add form submit handler
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateCitation();
            });
        }
        
        // Add event listeners to generate buttons
        document.querySelectorAll('.btn-generate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateCitation();
            });
        });
        
        // Add event listeners to example buttons
        document.querySelectorAll('.btn-example').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.fillExample();
            });
        });
        
        // Add event listeners to clear buttons
        document.querySelectorAll('.btn-clear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearForm();
            });
        });
        
        // Form validation
        const requiredInputs = document.querySelectorAll('input[required]');
        requiredInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
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
                    const sourceTypeSelect = document.getElementById('sourceType');
                    if (sourceTypeSelect) {
                        sourceTypeSelect.value = data.sourceType;
                        this.currentSourceType = data.sourceType;
                        this.updateFormFields();
                    }
                }
                
                // Set form values
                const fields = ['author', 'year', 'title', 'publisher', 'url', 'isbn'];
                fields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element && data[field]) {
                        element.value = data[field];
                    }
                });
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
        const isbnBtn = document.querySelector('.isbn-input-group .btn');
        
        if (isbnInput) {
            isbnInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.fetchByISBN();
                }
            });
        }
        
        if (isbnBtn) {
            isbnBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.fetchByISBN();
            });
        }
    }

    async fetchByISBN() {
        const isbnInput = document.getElementById('isbnInput');
        const isbnResult = document.getElementById('isbnResult');
        
        if (!isbnInput) {
            // Try alternative selectors
            isbnInput = document.querySelector('.isbn-input');
        }
        
        if (!isbnInput || !isbnResult) {
            console.warn('ISBN input or result container not found');
            return;
        }
        
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
            <div class="loading" style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>Searching for book details...</p>
            </div>
        `;
        
        try {
            const bookData = await this.fetchBookData(cleanISBN);
            
            if (bookData) {
                this.populateFormWithBookData(bookData);
                
                isbnResult.innerHTML = `
                    <div class="success" style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 10px 0; border-radius: 4px;">
                        <div class="book-info" style="display: flex; gap: 15px; align-items: flex-start;">
                            <div class="book-cover" style="background: #3498db; color: white; width: 60px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                                <i class="fas fa-book" style="font-size: 30px;"></i>
                            </div>
                            <div class="book-details" style="flex: 1;">
                                <h5 style="margin: 0 0 10px 0; color: #2c3e50;">${bookData.title || 'Unknown Title'}</h5>
                                <p style="margin: 5px 0; font-size: 14px;"><strong>Author:</strong> ${bookData.author || 'Unknown'}</p>
                                <p style="margin: 5px 0; font-size: 14px;"><strong>Publisher:</strong> ${bookData.publisher || 'Unknown'}</p>
                                <p style="margin: 5px 0; font-size: 14px;"><strong>Year:</strong> ${bookData.year || 'Unknown'}</p>
                                <p style="margin: 5px 0; font-size: 14px;"><strong>ISBN:</strong> ${this.formatISBN(cleanISBN)}</p>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="citationGenerator.useThisBook()" style="margin-top: 10px;">
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
                <div class="error" style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; margin: 10px 0; border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-exclamation-triangle" style="color: #f44336; font-size: 20px;"></i>
                        <strong>Book Not Found</strong>
                    </div>
                    <p style="margin: 0; font-size: 14px;">Unable to find book details for this ISBN.</p>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">Please try manual entry or check the ISBN.</p>
                </div>
            `;
            this.trackEvent('isbn_lookup', 'error', cleanISBN);
        }
    }

    async fetchBookData(isbn) {
        // Try multiple APIs
        const apis = [
            this.tryOpenLibraryAPI(isbn),
            this.tryGoogleBooksAPI(isbn),
            this.tryWorldCatAPI(isbn)
        ];
        
        for (const apiPromise of apis) {
            try {
                const bookData = await apiPromise;
                if (bookData) {
                    return bookData;
                }
            } catch (error) {
                console.log('API failed, trying next...');
            }
        }
        
        return null;
    }

    async tryOpenLibraryAPI(isbn) {
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
                        year: book.publish_date ? this.extractYear(book.publish_date) : '',
                        isbn: isbn
                    };
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async tryGoogleBooksAPI(isbn) {
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
                        year: book.publishedDate ? this.extractYear(book.publishedDate) : '',
                        isbn: isbn
                    };
                }
            }
        } catch (error) {
            throw error;
        }
    }

    async tryWorldCatAPI(isbn) {
        // Fallback: Try to get basic info
        try {
            // This is a simplified approach - in production you'd use proper API
            return {
                title: `Book (ISBN: ${isbn})`,
                author: 'Unknown Author',
                publisher: 'Unknown Publisher',
                year: new Date().getFullYear().toString(),
                isbn: isbn
            };
        } catch (error) {
            throw error;
        }
    }

    extractYear(dateString) {
        try {
            const date = new Date(dateString);
            return date.getFullYear().toString();
        } catch (e) {
            // Try to extract year from string
            const yearMatch = dateString.match(/\b(\d{4})\b/);
            return yearMatch ? yearMatch[1] : '';
        }
    }

    populateFormWithBookData(bookData) {
        // Set form values
        const authorField = document.getElementById('author');
        const yearField = document.getElementById('year');
        const titleField = document.getElementById('title');
        const publisherField = document.getElementById('publisher');
        const isbnField = document.getElementById('isbn');
        
        if (authorField) authorField.value = bookData.author || '';
        if (yearField) yearField.value = bookData.year || '';
        if (titleField) titleField.value = bookData.title || '';
        if (publisherField) publisherField.value = bookData.publisher || '';
        if (isbnField) isbnField.value = this.formatISBN(bookData.isbn) || '';
        
        // Set source type to book
        const sourceTypeSelect = document.getElementById('sourceType');
        if (sourceTypeSelect) {
            sourceTypeSelect.value = 'book';
            this.currentSourceType = 'book';
            this.updateFormFields();
        }
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
        const isbnInput = document.getElementById('isbnInput') || document.querySelector('.isbn-input');
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
            const citationData = { author, year, title, publisher, journal, volume, issue, pages, url, isbn, sourceType: this.currentSourceType };
            
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
                resultElement.innerHTML = `<pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; line-height: 1.6;">${citation}</pre>`;
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
        citation += `${authors}. `;
        citation += `(${data.year}). `;
        
        // Add title with proper formatting
        if (data.sourceType === 'book') {
            citation += `<i>${data.title}.</i> `;
            if (data.publisher) {
                citation += `${data.publisher}.`;
            }
        } else if (data.sourceType === 'journal') {
            citation += `${data.title}. `;
            if (data.journal) {
                citation += `<i>${data.journal}</i>`;
                if (data.volume) {
                    citation += `, <i>${data.volume}</i>`;
                    if (data.issue) {
                        citation += `(${data.issue})`;
                    }
                }
                if (data.pages) {
                    citation += `, ${data.pages}.`;
                } else {
                    citation += `.`;
                }
            }
        } else if (data.sourceType === 'website') {
            citation += `${data.title}. `;
            if (data.url) {
                citation += `Retrieved from ${data.url}`;
            }
        } else {
            citation += `${data.title}.`;
            if (data.publisher) {
                citation += ` ${data.publisher}.`;
            }
        }
        
        // Add DOI or URL if available
        if (data.url && data.sourceType !== 'website') {
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
        
        // Format authors
        let authors = data.author;
        citation += `${authors}. `;
        
        // Title
        if (data.sourceType === 'book') {
            citation += `<i>${data.title}.</i> `;
        } else {
            citation += `"${data.title}." `;
        }
        
        // Container/Publication info
        if (data.sourceType === 'journal') {
            if (data.journal) {
                citation += `<i>${data.journal}</i>, `;
            }
            if (data.volume) {
                citation += `vol. ${data.volume}, `;
            }
            if (data.issue) {
                citation += `no. ${data.issue}, `;
            }
            citation += `${data.year}, `;
            if (data.pages) {
                citation += `pp. ${data.pages}.`;
            }
        } else if (data.sourceType === 'book') {
            if (data.publisher) {
                citation += `${data.publisher}, ${data.year}.`;
            } else {
                citation += `${data.year}.`;
            }
        } else {
            citation += `${data.publisher}, ${data.year}.`;
        }
        
        // Add URL if available
        if (data.url) {
            citation += ` ${data.url}.`;
        }
        
        return citation;
    }

    generateChicagoCitation(data) {
        let citation = '';
        
        // Format authors
        let authors = data.author;
        citation += `${authors}. `;
        
        // Title and publication info
        if (data.sourceType === 'book') {
            citation += `<i>${data.title}.</i> `;
            if (data.publisher) {
                citation += `${data.publisher}, ${data.year}.`;
            } else {
                citation += `${data.year}.`;
            }
        } else if (data.sourceType === 'journal') {
            citation += `"${data.title}." `;
            if (data.journal) {
                citation += `<i>${data.journal}</i> `;
                if (data.volume) {
                    citation += `${data.volume}`;
                    if (data.issue) {
                        citation += `, no. ${data.issue}`;
                    }
                    if (data.pages) {
                        citation += ` (${data.year}): ${data.pages}.`;
                    } else {
                        citation += ` (${data.year}).`;
                    }
                }
            }
        } else {
            citation += `"${data.title}." `;
            if (data.publisher) {
                citation += `${data.publisher}, ${data.year}.`;
            } else {
                citation += `${data.year}.`;
            }
        }
        
        // Add URL if available
        if (data.url) {
            citation += ` ${data.url}`;
        }
        
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
        
        // Update form fields
        const fields = ['author', 'year', 'title', 'publisher', 'journal', 'volume', 'issue', 'pages', 'url', 'isbn'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && example[field]) {
                element.value = example[field];
            }
        });
        
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
        
        // Clear ISBN lookup
        const isbnInput = document.getElementById('isbnInput') || document.querySelector('.isbn-input');
        const isbnResult = document.getElementById('isbnResult');
        if (isbnInput) isbnInput.value = '';
        if (isbnResult) isbnResult.innerHTML = '';
        
        // Reset result area
        const result = document.getElementById('result');
        if (result) {
            result.innerHTML = `
                <div class="result-placeholder" style="text-align: center; color: #666;">
                    <i class="fas fa-file-alt" style="font-size: 48px; margin-bottom: 15px; color: #3498db;"></i>
                    <p style="font-size: 16px; margin-bottom: 5px;">Your citation will appear here</p>
                    <p class="placeholder-sub" style="font-size: 14px; color: #888;">Fill the form and click "Generate Citation"</p>
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
        
        const pre = result.querySelector('pre');
        if (!pre) {
            this.showAlert('No citation to copy. Please generate a citation first.', 'error');
            return;
        }
        
        const text = pre.textContent;
        if (!text || text.includes('Your citation will appear here')) {
            this.showAlert('No citation to copy. Please generate a citation first.', 'error');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            // Find and update copy button
            const copyButtons = document.querySelectorAll('.btn-copy');
            copyButtons.forEach(btn => {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.style.background = '#2ecc71';
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                }, 2000);
            });
            
            this.showAlert('Citation copied to clipboard!', 'success');
            this.trackEvent('citation', 'copy');
            
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showAlert('Failed to copy citation. Please try again.', 'error');
        });
    }

    // ======================
    // ALERT SYSTEM
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
        
        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-left: 4px solid #3498db;
                    border-radius: 4px;
                    padding: 15px 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 9999;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { border-left-color: #2ecc71; }
                .notification-error { border-left-color: #e74c3c; }
                .notification-info { border-left-color: #3498db; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-content i {
                    font-size: 20px;
                }
                .notification-success i { color: #2ecc71; }
                .notification-error i { color: #e74c3c; }
                .notification-info i { color: #3498db; }
                .notification-close {
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 5px;
                    margin-left: 10px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
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
    // ANALYTICS FUNCTIONS
    // ======================
    initAnalytics() {
        // Track page view
        this.trackPageView();
        
        // Track interactions
        this.trackInteractions();
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
            
            gtag('event', action, eventParams);
        }
        
        // Also log to console for debugging
        console.log(`[Analytics] ${category}.${action}`, label ? `Label: ${label}` : '', value ? `Value: ${value}` : '');
    }

    trackInteractions() {
        // Track button clicks
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function() {
                const text = this.textContent.trim() || this.getAttribute('aria-label') || 'button';
                citationGenerator.trackEvent('ui', 'click', text);
            });
        });
    }

    // ======================
    // SERVICE WORKER
    // ======================
    initServiceWorker() {
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
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
            const isbnInput = document.getElementById('isbnInput') || document.querySelector('.isbn-input');
            if (isbnInput) {
                isbnInput.value = isbn;
                setTimeout(() => this.fetchByISBN(), 1000);
            }
        }
    }

    // ======================
    // INITIALIZATION
    // ======================
    initCitationHistory() {
        this.loadCitationHistory();
    }

    initPremiumFeatures() {
        // Check if user has premium
        const premiumStatus = localStorage.getItem('premiumUser');
        this.premiumUser = premiumStatus === 'true';
    }

    saveCitationToHistory(citation) {
        // Implementation for saving citation to history
        try {
            const history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
            history.unshift({
                id: Date.now(),
                citation: citation,
                style: this.currentStyle,
                date: new Date().toISOString()
            });
            
            // Keep only last 20 items
            if (history.length > 20) {
                history.length = 20;
            }
            
            localStorage.setItem('citationHistory', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to save citation history:', e);
        }
    }

    loadCitationHistory() {
        try {
            const history = JSON.parse(localStorage.getItem('citationHistory') || '[]');
            this.citationHistory = history;
        } catch (e) {
            console.error('Failed to load citation history:', e);
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
window.fetchByISBN = () => citationGenerator.fetchByISBN();
window.useThisBook = () => citationGenerator.useThisBook();

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
    
    // Ctrl/Cmd + C to copy
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        citationGenerator.copyCitation();
    }
});

console.log('Enhanced Citation Generator loaded successfully');
