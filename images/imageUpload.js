function processImages() {
    const fileInput = document.getElementById('image-upload');
    const files = Array.from(fileInput.files);
    const previewDiv = document.getElementById('image-preview');
    const progressDiv = document.getElementById('upload-progress');

    // Clear previous previews
    previewDiv.innerHTML = '';

    if (files.length === 0) {
        progressDiv.innerHTML = 'Please select at least one image';
        return;
    }

    // Show previews
    files.forEach(file => {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';

        // Check if file is video or image
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        let mediaElement;

        if (isVideo) {
            // Create video element
            mediaElement = document.createElement('video');
            mediaElement.controls = true;
            mediaElement.style.maxWidth = '200px';
            mediaElement.style.maxHeight = '200px';
            mediaElement.style.margin = '10px';
            
            // Add video icon indicator
            const videoIcon = document.createElement('div');
            videoIcon.innerHTML = '🎥 Video';
            videoIcon.style.fontSize = '12px';
            videoIcon.style.color = '#666';
            videoIcon.style.marginBottom = '5px';
            previewContainer.appendChild(videoIcon);
            
        } else if (isImage) {
            // Create image element
            mediaElement = document.createElement('img');
            mediaElement.style.maxWidth = '200px';
            mediaElement.style.maxHeight = '200px';
            mediaElement.style.margin = '10px';
            
            // Add image icon indicator
            const imageIcon = document.createElement('div');
            imageIcon.innerHTML = '🖼️ Image';
            imageIcon.style.fontSize = '12px';
            imageIcon.style.color = '#666';
            imageIcon.style.marginBottom = '5px';
            previewContainer.appendChild(imageIcon);
            
        } else {
            // Unknown file type
            mediaElement = document.createElement('div');
            mediaElement.innerHTML = `📄 ${file.type || 'Unknown file type'}`;
            mediaElement.style.width = '200px';
            mediaElement.style.height = '100px';
            mediaElement.style.margin = '10px';
            mediaElement.style.border = '2px dashed #ccc';
            mediaElement.style.display = 'flex';
            mediaElement.style.alignItems = 'center';
            mediaElement.style.justifyContent = 'center';
            mediaElement.style.fontSize = '14px';
            mediaElement.style.color = '#666';
        }

        const nameLabel = document.createElement('div');
        nameLabel.textContent = file.name;
        nameLabel.className = 'file-name';
        nameLabel.style.fontSize = '12px';
        nameLabel.style.color = '#333';
        nameLabel.style.marginTop = '5px';
        nameLabel.style.wordBreak = 'break-word';

        // Create object URL and set source
        if (isVideo || isImage) {
            const objectUrl = URL.createObjectURL(file);
            mediaElement.src = objectUrl;

            // Clean up object URL when element loads
            mediaElement.onload = mediaElement.onloadeddata = () => {
                URL.revokeObjectURL(objectUrl);
            };

            // Handle errors
            mediaElement.onerror = () => {
                console.error(`Failed to load ${isVideo ? 'video' : 'image'}:`, file.name);
                mediaElement.style.border = '2px solid #ff4444';
                mediaElement.alt = `Failed to load ${file.name}`;
            };
        }

        previewContainer.appendChild(mediaElement);
        previewContainer.appendChild(nameLabel);
        previewDiv.appendChild(previewContainer);
    });

    // Upload files via Worker
    uploadViaWorker(files);
}

async function uploadViaWorker(files) {
    const progressDiv = document.getElementById('upload-progress');
    const formData = new FormData();

    files.forEach(file => {
        formData.append('files', file);
    });

    try {
        progressDiv.innerHTML = 'Uploading files...';

        const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
        }

        if (result.success) {
            progressDiv.innerHTML = 'All files uploaded successfully!';
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        progressDiv.innerHTML = `Upload error: ${error.message}`;
        console.error('Upload failed:', error);
    }
}

// Helper Functions

async function fetchFromPerplexityDirect(query) {
    try {
        const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/perplexity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query // Send query directly, no template
            })
        });

        const data = await response.json();
        console.log('Perplexity Direct Response:', data);

        if (data && data.success && data.result) {
            if (data.result.choices &&
                data.result.choices[0] &&
                data.result.choices[0].message &&
                data.result.choices[0].message.content) {

                let content = data.result.choices[0].message.content;
                content = content.replace(/```json\n*/g, '').replace(/```/g, '').trim();

                try {
                    const parsedData = JSON.parse(content);
                    console.log('Successfully parsed direct Perplexity data:', parsedData);
                    return { choices: [{ message: { content: JSON.stringify(parsedData) } }] };
                } catch (parseError) {
                    console.error('Error parsing direct content:', parseError);
                    console.log('Content that failed to parse:', content);
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Perplexity Direct API error:', error);
        return null;
    }
}

function extractISBNData(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        let title = null;
        const titleSelectors = ['h1', '.title', '[data-testid="title"]', 'meta[property="og:title"]'];
        
        for (const selector of titleSelectors) {
            const element = doc.querySelector(selector);
            if (element) {
                title = element.textContent || element.getAttribute('content');
                break;
            }
        }
        
        let author = null;
        const authorSelectors = ['.author', '[data-testid="author"]', 'meta[name="author"]'];
        
        for (const selector of authorSelectors) {
            const element = doc.querySelector(selector);
            if (element) {
                author = element.textContent || element.getAttribute('content');
                break;
            }
        }
        
        let publisher = null;
        const publisherSelectors = ['.publisher', '[data-testid="publisher"]'];
        
        for (const selector of publisherSelectors) {
            const element = doc.querySelector(selector);
            if (element) {
                publisher = element.textContent;
                break;
            }
        }
        
        title = title ? title.trim().replace(/^Title:\s*/i, '') : null;
        author = author ? author.trim().replace(/^Author:\s*/i, '') : null;
        publisher = publisher ? publisher.trim().replace(/^Publisher:\s*/i, '') : null;
        
        return {
            title: title,
            author: author,
            publisher: publisher
        };
        
    } catch (error) {
        console.error('Error parsing ISBN search HTML:', error);
        return null;
    }
}

//v3 - with perplexity

async function preFetchFromAI() {
    const title = document.getElementById('title').value;
    const isbn = document.getElementById('isbn').value;
    let family_name = document.getElementById('family_name').value;
    let given_name = document.getElementById('given_name').value;

    if (!title && !isbn) {
        console.log('Please enter either a title or ISBN');
        const noInputAlert = document.querySelector(".no-input-alert");
        const noInputBackdrop = document.querySelector(".no-input-backdrop");
        const noInputCloseBtn = noInputAlert.querySelector(".close-btn");

        noInputAlert.style.display = "block";
        noInputBackdrop.style.display = "block";

        function hideNoInputAlert() {
            noInputAlert.style.display = "none";
            noInputBackdrop.style.display = "none";
        }

        noInputCloseBtn.addEventListener("click", hideNoInputAlert);
        noInputBackdrop.addEventListener("click", hideNoInputAlert);
        return;
    }

    try {
        let metadata = null;

        // If we have a title but no ISBN, try Perplexity first
        if (title && !isbn) {
            console.log('Title-only search, trying Perplexity first...');
            let searchQuery = title;
            if (family_name || given_name) {
                const authorName = [given_name, family_name].filter(Boolean).join(' ');
                searchQuery = `${title} by ${authorName}`;
            }
            const perplexityData = await fetchFromPerplexity(searchQuery);
            if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
                try {
                    // Parse the JSON string from the content
                    metadata = JSON.parse(perplexityData.choices[0].message.content);
                    console.log('Parsed metadata:', metadata);
                } catch (error) {
                    console.error('Error parsing Perplexity content:', error);
                }
            }
        } else {
            // Try OpenLibrary for ISBN cases or as fallback
            let openLibraryData = null;
            let isbnData = null;
            let searchQuery = isbn || title;

            try {
                const olResponse = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}`);
                const olText = await olResponse.text();

                // Check if response is HTML (error) by looking for DOCTYPE
                if (olText.trim().startsWith('<!DOCTYPE')) {
                    throw new Error('OpenLibrary returned HTML instead of JSON');
                }

                openLibraryData = JSON.parse(olText);
                console.log('Open Library Search API Response:', openLibraryData);

                if (isbn) {
                    const isbnResponse = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
                    const isbnText = await isbnResponse.text();

                    if (isbnText.trim().startsWith('<!DOCTYPE')) {
                        throw new Error('OpenLibrary ISBN lookup returned HTML instead of JSON');
                    }

                    isbnData = JSON.parse(isbnText);
                    console.log('Open Library ISBN API Response:', isbnData);

                    if (isbn && isbnData) {
                        const returnedISBN = isbnData.isbn_13?.[0] || isbnData.isbn_10?.[0];
                        if (returnedISBN !== isbn) {
                            console.log(`ISBN mismatch: searched for ${isbn}, got ${returnedISBN}`);
                            throw new Error('OpenLibrary returned wrong book data');
                        }
                    }
                }

                console.log('Enhancing with Perplexity using all available data...');


                const enhancedQuery = `
                    Book search with multiple data sources:
                    Title: ${title || 'Not provided'}
                    ISBN: ${isbn || 'Not provided'}
                    Author: ${[given_name, family_name].filter(Boolean).join(' ') || 'Not provided'}

                    OpenLibrary Search Data: ${JSON.stringify(openLibraryData)}
                    OpenLibrary ISBN Data: ${JSON.stringify(isbnData)}

                    Please analyze ALL this information from OpenLibrary along with fresh searches from Amazon, bookstores, and other sources to provide the most accurate and complete book metadata. Use OpenLibrary data as reference but prioritize more complete information from current retail sources for fields. 
                    
                    Find comprehensive book metadata for the book titled: "${title}". 
                    Primary search sources (in order of priority):
                    1. Amazon.com - Look for complete product details including dimensions of the book
                    2. Amazon.ae / Amazon.in - Regional listings
                    3. Ubuy.ae
                    4. Barnes & Noble (barnesandnoble.com)
                    5. Book Depository (bookdepository.com)
                    6. Jamalon.com
                    7. Noon.com books section

                    Secondary sources if needed:
                    - Publisher's official website
                    - WorldCat.org
                    - Goodreads.com
                    - Google Books
                    For each field, explicitly state if you found the information or not.
                    Return the data in this exact JSON format: {
                    "title": "Full book title",
                    "translit_title": "Transliterated title if original is non-English, otherwise null",
                    "subtitle": "Alternative book title",
                    "translit_subtitle": "Transliterated subtitle if original is non-English, otherwise null",
                    "isbn": "ISBN-13 or null",
                    "edition": "Edition information or null",
                    "language": "Language code (eng, fre, etc.) or null",
                    "publisher": ["Publisher name(s)"],
                    "authors": [
                        {"familyName": "Last name", "givenName": "First name"}
                    ],
                    "placeOfPublication": ["City names"],
                    "publicationCountry": "Full country name",
                    "publicationDate": "YYYY format",
                    "copyrightDate": "YYYY format or null",
                    "numberOfPages": Number of pages or null,
                    "dimensions": "Dimensions of book should in cm (Always use the dimensions in this format 22.86 x 15.24 x 3.00) If it's in any other format than cm then convert it to cm. If no dimensions are found return an empty value, always rely on the source which mentions dimensions.",
                    "synopsisOfBook": Synopsis of the book
                    }
                            IMPORTANT: If the title or subtitle contains non-English characters (Arabic, Chinese, Russian, etc.), provide both the original AND a transliterated version using Latin characters. For example:
                    - Original Arabic: "الأسود يليق بك" 
                    - Transliterated: "Al-Aswad Yaleeq Bik"
                    Use null for truly unknown values only after thorough searching. Only return the json and nothing else. Do not start with words json, just return the json and nothing else.
                    Search instructions:
                    1. Start with Amazon.com/Amazon.ae listings
                    2. Cross-reference with Ubuy.ae
                    3. Check other primary sources in order
                    4. Only use secondary sources if data is missing
                    5. Include citation for each piece of information found
                    6. Convert all measurements to centimeters
                    7. Use null only when information cannot be found in ANY source listed
                    Only return the json and nothing else. Do not start with words json, just return the json and nothing else.
                    IMPORTANT: Prioritize Amazon listings for dimensions and complete product details. Only return JSON, no other text and remove citations indications (ie [1][2][3]etc).
                    `;


                const perplexityData = await fetchFromPerplexity(enhancedQuery);
                if (perplexityData?.choices?.[0]?.message?.content) {
                    // Check if it's an error response (no citations, etc.)
                    if (perplexityData.error) {
                        console.log(`Perplexity failed: ${perplexityData.error} - ${perplexityData.message}`);
                        throw new Error(`Perplexity validation failed: ${perplexityData.error}`);
                    }
                    
                    // NEW: Check for empty citations (hallucination indicator)
                    if (perplexityData.citations && perplexityData.citations.length === 0) {
                        console.log('⚠️ Perplexity returned no citations - likely hallucinating, triggering fallback');
                        throw new Error('No citations found - potential hallucination');
                    }
                    
                    metadata = JSON.parse(perplexityData.choices[0].message.content);
                    console.log('✅ Enhanced metadata from Perplexity with valid citations:', metadata);
                } else {
                    console.log('❌ No valid Perplexity response, triggering fallback');
                    throw new Error('No valid Perplexity response');
                }
            } catch (error) {
            console.log('OpenLibrary error, falling back to ISBN search + Perplexity:', error);
            
            if (isbn) {
                console.log(`Trying ISBN search for: ${isbn}`);
                
                try {
                    // Step 1: Get basic info from ISBN search via worker
                    const isbnResponse = await fetch('https://metadata-maker.adb-aditya.workers.dev/isbn-search', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            isbn: isbn
                        })
                    });

                    const isbnResult = await isbnResponse.json();
                    console.log('ISBN search result:', isbnResult);

                    if (isbnResult.success && isbnResult.data) {
                        let isbnData = isbnResult.data;
                        console.log('ISBN search data:', isbnData);
                        
                        if (isbnData && (isbnData.title || isbnData.author)) {
                            const contextQuery = `
                                I found this book information from ISBN database:
                                Find comprehensive book metadata for the book with these details:
                                - ISBN: ${isbn}
                                - Title: ${isbnData.title || 'Unknown'}
                                - Author: ${isbnData.author || 'Unknown'}
                                - Publisher: ${isbnData.publisher || 'Unknown'}
                                
                                Search major bookstores for this exact title and author combination.
                    
                    Primary search sources (in order of priority):
                    1. Amazon.com / Amazon.ae / Amazon.in
                    2. Google Books
                    3. WorldCat.org
                    4. Barnes & Noble (barnesandnoble.com)
                    5. Book Depository (bookdepository.com)
                    6. Ubuy.ae
                    7. Jamalon.com
                    8. Noon.com books section
                    9. ThriftBooks
                    
                    Return data in this exact JSON format:
                    {
                        "title": "Full book title",
                        "translit_title": "Transliterated title if original is non-English, otherwise null",
                        "subtitle": "Subtitle or if exists, otherwise null",
                        "translit_subtitle": "Transliterated subtitle if original is non-English, otherwise null",
                        "isbn": "ISBN if found, otherwise null",
                        "edition": "Edition information or null",
                        "language": "Language code (eng, fre, etc.)",
                        "publisher": ["Publisher name"],
                        "authors": [{"familyName": "Last name", "givenName": "First name"}],
                        "placeOfPublication": ["City names"],
                        "publicationCountry": "Full country name",
                        "publicationDate": "YYYY format",
                        "copyrightDate": "YYYY format or null",
                        "numberOfPages": "Number of pages",
                        "dimensions": "Look for dimensions of the book in the page. If Dimensions of book in cm (Always the dimensions in this format 22.86 x 15.24 x 3.00) If it's in any other format than cm then convert it to cm. If no dimensions are found return an empty value",
                        "synopsisOfBook": "Book description"
                    }
                
                    Only return JSON, nothing else.
                            `;

                            console.log(contextQuery);
                            
                            const perplexityData = await fetchFromPerplexityDirect(contextQuery);
                            if (perplexityData?.choices?.[0]?.message?.content) {
                                try {
                                    metadata = JSON.parse(perplexityData.choices[0].message.content);
                                    if (metadata.error) {
                                        console.log('Perplexity search with ISBN context failed:', metadata.error);
                                        throw new Error('ISBN-based search failed');
                                    } else {
                                        console.log('Found metadata via ISBN + Perplexity:', metadata);
                                    }
                                } catch (parseError) {
                                    console.error('Error parsing ISBN-based response:', parseError);
                                    throw new Error('Failed to parse ISBN search results');
                                }
                            }
                        } else {
                            throw new Error('No valid data from ISBN search');
                        }
                    } else {
                        throw new Error(isbnResult.error || 'ISBN search failed');
                    }
                    
                } catch (isbnError) {
                    console.log('ISBN search also failed:', isbnError);
                    alert('Book not found in any database. Please enter details manually.');
                }
                
            } else {
                // No ISBN provided - use title/author search fallback
                console.log('No ISBN provided, using title/author search');
                
                let searchDetails = [];
                if (title) searchDetails.push(`Title: "${title}"`);
                if (family_name || given_name) {
                    const authorName = [given_name, family_name].filter(Boolean).join(' ');
                    searchDetails.push(`Author: ${authorName}`);
                }
                
                if (searchDetails.length === 0) {
                    alert('No search criteria provided. Please enter title, author, or ISBN.');
                    return;
                }
                
                const searchTerm = searchDetails.join(', ');
                console.log('Comprehensive search term:', searchTerm);

                const enhancedQuery = `
                    Find comprehensive book metadata for the book with these details: ${searchTerm}
                    
                    Search major bookstores for this exact title and author combination.
                    
                    Primary search sources (in order of priority):
                    1. Amazon.com / Amazon.ae / Amazon.in
                    2. Google Books
                    3. WorldCat.org
                    4. Barnes & Noble (barnesandnoble.com)
                    5. Book Depository (bookdepository.com)
                    6. Ubuy.ae
                    7. Jamalon.com
                    8. Noon.com books section
                    
                    Return data in this exact JSON format:
                    {
                        "title": "Full book title",
                        "translit_title": "Transliterated title if original is non-English, otherwise null",
                        "subtitle": "Subtitle if exists, otherwise null",
                        "translit_subtitle": "Transliterated subtitle if original is non-English, otherwise null",
                        "isbn": "ISBN if found, otherwise null",
                        "edition": "Edition information or null",
                        "language": "Language code (eng, fre, etc.)",
                        "publisher": ["Publisher name"],
                        "authors": [{"familyName": "Last name", "givenName": "First name"}],
                        "placeOfPublication": ["City names"],
                        "publicationCountry": "Full country name",
                        "publicationDate": "YYYY format",
                        "copyrightDate": "YYYY format or null",
                        "numberOfPages": "Number of pages",
                        "dimensions": "Dimensions in cm (format: 22.86 x 15.24 x 3.00)",
                        "synopsisOfBook": "Book description"
                    }
                    
                    CRITICAL: If no book matches these details exactly, return {"error": "Book not found", "searched_details": "${searchTerm}"}
                    Only return JSON, nothing else.
                `;
                
                const perplexityData = await fetchFromPerplexity(enhancedQuery);
                if (perplexityData?.choices?.[0]?.message?.content) {
                    try {
                        metadata = JSON.parse(perplexityData.choices[0].message.content);
                        if (metadata.error) {
                            console.log('Title-based search failed:', metadata.error);
                            alert('Book not found in any database. Please enter details manually.');
                        } else {
                            console.log('Found metadata via title/author search:', metadata);
                        }
                    } catch (parseError) {
                        console.error('Error parsing title-based response:', parseError);
                        alert('Error parsing search results. Please enter details manually.');
                    }
                }
            }
        }
    } 
        // If we have metadata from either source, populate the form
        if (metadata) {
            console.log('Final Metadata:', metadata);
            // Populate form fields
            document.getElementById('title').value = metadata.title || '';
            document.getElementById('isbn').value = metadata.isbn || '';
            document.getElementById('edition').value = metadata.edition || '';
            document.getElementById('language').value = metadata.language || '';
            document.getElementById('pages').value = metadata.numberOfPages || '';
            document.getElementById('dimensions').value = metadata.dimensions || '';
            document.getElementById('subtitle').value = metadata.subtitle || '';

            // NEW: Handle transliteration fields
            const translitTitleField = document.getElementById('translit_title');
            const translitSubtitleField = document.getElementById('translit_subtitle');

            if (metadata.translit_title) {
                translitTitleField.value = metadata.translit_title;
                translitTitleField.style.display = 'inline-block';
            } else {
                translitTitleField.style.display = 'none';
            }

            if (metadata.translit_subtitle) {
                translitSubtitleField.value = metadata.translit_subtitle;
                translitSubtitleField.style.display = 'inline-block';
            } else {
                translitSubtitleField.style.display = 'none';
            }

            document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                ? metadata.placeOfPublication[0]
                : (metadata.placeOfPublication || '');

            document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                ? metadata.publisher[0]
                : (metadata.publisher || '');

            document.getElementById('year').value = metadata.publicationDate || '';
            document.getElementById('notes').value = metadata.synopsisOfBook || '';

            if (metadata.authors?.length > 0) {
                document.getElementById('family_name').value = metadata.authors[0].familyName || '';
                document.getElementById('given_name').value = metadata.authors[0].givenName || '';
            }

            // Handle country dropdown
            const countrySelect = document.querySelector('select[name="country"]');
            if (countrySelect && metadata.publicationCountry) {
                Array.from(countrySelect.options).forEach(option => {
                    if (option.text.toLowerCase() === metadata.publicationCountry.toLowerCase()) {
                        countrySelect.value = option.value;
                    }
                });
            }
            
            // Add required attribute to the fields
            const familyNameInput = document.getElementById("family_name");
            const givenNameInput = document.getElementById("given_name");
            const subtitleInput = document.getElementById("subtitle");

            // Add required attribute
            familyNameInput.setAttribute("required", "");
            givenNameInput.setAttribute("required", "");
            subtitleInput.setAttribute("required", "");

            // Function to set initial border color based on value
            const setInitialBorderColor = (input) => {
                if (!input.value.trim()) {
                    input.style.borderColor = "#ff4444";
                    input.placeholder = input.placeholder + " *";
                }
            };

            // Set initial states
            setInitialBorderColor(familyNameInput);
            setInitialBorderColor(givenNameInput);

            // Add event listeners to handle input changes
            const handleInput = (input) => {
                input.addEventListener("input", function () {
                    if (this.value.trim() !== "") {
                        this.style.borderColor = ""; // Reset to default
                    } else {
                        this.style.borderColor = "#ff4444"; // Keep red if empty
                    }
                });
            };

            handleInput(familyNameInput);
            handleInput(givenNameInput);
            
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchFromPerplexity(title) {
    try {
        const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/perplexity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `Find comprehensive book metadata for the book with these details: "${title}". 
                    Primary search sources (in order of priority):
1. Amazon.com / Amazon.ae / Amazon.in
2. Ubuy.ae
3. Barnes & Noble (barnesandnoble.com)
4. Book Depository (bookdepository.com)
5. Jamalon.com
6. Noon.com books section

Secondary sources if needed:
- Publisher's official website
- WorldCat.org
- Goodreads.com
- Google Books
                    For each field, explicitly state if you found the information or not.
                    Return the data in this exact JSON format: {
                    "title": "Full book title",
                    "translit_title": "Transliterated title if original is non-English, otherwise null",
                    "subtitle": "Alternative book title",
                    "translit_subtitle": "Transliterated subtitle if original is non-English, otherwise null",
                    "isbn": "ISBN-13 or null",
                    "edition": "Edition information or null",
                    "language": "Language code (eng, fre, etc.) or null",
                    "publisher": ["Publisher name(s)"],
                    "authors": [
                        {"familyName": "Last name", "givenName": "First name"}
                    ],
                    "placeOfPublication": ["City names"],
                    "publicationCountry": "Full country name",
                    "publicationDate": "YYYY format",
                    "copyrightDate": "YYYY format or null",
                    "numberOfPages": Number of pages or null,
                    "dimensions": "Dimensions of book in cm (Always the dimensions in this format 22.86 x 15.24 x 3.00) If it's in any other format than cm then convert it to cm. If no dimensions are found return an empty value",
                    "synopsisOfBook": Synopsis of the book
                    }
                            IMPORTANT: If the title or subtitle contains non-English characters (Arabic, Chinese, Russian, etc.), provide both the original AND a transliterated version using Latin characters. For example:
        - Original Arabic: "الأسود يليق بك" 
        - Transliterated: "Al-Aswad Yaleeq Bik"
                    Use null for truly unknown values only after thorough searching. Only return the json and nothing else. Do not start with words json, just return the json and nothing else.
                    Search instructions:
1. Give priority to Amazon.com/Amazon.ae listings
2. Cross-reference with Ubuy.ae
3. Check other primary sources in order
4. Only use secondary sources if data is missing
5. Include citation for each piece of information found
6. Convert all measurements to centimeters
7. Use null only when information cannot be found in ANY source listed
Only return the json and nothing else. Do not start with words json, just return the json and nothing else and remove citations indications (ie [1][2][3]etc).
                    `
            })
        });

        const data = await response.json();
        console.log('Perplexity Response:', data);

        if (data.result.citations && data.result.citations.length === 0) {
                console.log('⚠️ Perplexity returned no citations - likely hallucinating');
                return { error: 'no_citations', message: 'No sources found - potential hallucination' };
            }

        // Navigate through the nested structure to get the content
        if (data && data.success && data.result) {
            // Check if the API returned the nested structure we saw in your screenshot
            if (data.result.choices &&
                data.result.choices[0] &&
                data.result.choices[0].message &&
                data.result.choices[0].message.content) {

                let content = data.result.choices[0].message.content;

                // Clean up the content - remove markdown code blocks if present
                content = content.replace(/```json\n*/g, '').replace(/```/g, '').trim();

                try {
                    const parsedData = JSON.parse(content);
                    console.log('✅ Successfully parsed Perplexity data with citations:', parsedData);
                    return { 
                        choices: [{ message: { content: JSON.stringify(parsedData) } }],
                        citations: data.result.citations // Include citation info
                    };
                } catch (parseError) {
                    console.error('Error parsing cleaned content:', parseError);
                    return { error: 'parse_error', message: 'Could not parse response' };
                }
            } else {
                console.log('Expected data structure not found in Perplexity response');
            }
        }
        return null;
    } catch (error) {
        console.error('Perplexity API error:', error);
        return null;
    }
}

function ocrSearch() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;

    fileInput.onchange = async function (e) {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;

        console.log(`Processing ${files.length} image(s)...`);
        
        const progressDiv = document.getElementById('ocr-progress');
        if (progressDiv) {
            progressDiv.innerHTML = `Processing ${files.length} image(s) with OCR...`;
        }

        let allExtractedText = '';
        let processedCount = 0;

        // Process each image sequentially
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Processing image ${i + 1}/${files.length}:`, file.name);
            console.log('Original size:', file.size / 1024 / 1024, 'MB');

            try {
                const compressedImage = await compressImage(file);
                console.log('Compressed size:', compressedImage.size / 1024 / 1024, 'MB');

                const formData = new FormData();
                formData.append('image', compressedImage, file.name);

                if (progressDiv) {
                    progressDiv.innerHTML = `Processing image ${i + 1}/${files.length}: ${file.name}...`;
                }

                const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/ocr', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log(`OCR Result for image ${i + 1}:`, result);

                if (result.success && result.result && result.result.ParsedResults) {
                    const extractedText = result.result.ParsedResults[0].ParsedText;
                    console.log(`Extracted Text from image ${i + 1}:`, extractedText);
                    
                    allExtractedText += `\n\n--- Text from ${file.name} ---\n${extractedText}`;
                    processedCount++;
                } else {
                    console.error(`OCR failed for image ${i + 1}: ${file.name}`);
                    allExtractedText += `\n\n--- Failed to extract text from ${file.name} ---\n`;
                }

            } catch (error) {
                console.error(`Error processing image ${i + 1}:`, error);
                allExtractedText += `\n\n--- Error processing ${file.name}: ${error.message} ---\n`;
            }
        }

        // Display results after processing all images
        if (progressDiv) {
            progressDiv.innerHTML = `OCR completed for ${processedCount}/${files.length} image(s). Extracted text:`;
            
            const textDisplay = document.createElement('div');
            textDisplay.style.maxHeight = '200px';
            textDisplay.style.overflow = 'auto';
            textDisplay.style.border = '1px solid #ccc';
            textDisplay.style.padding = '10px';
            textDisplay.style.marginTop = '10px';
            textDisplay.style.whiteSpace = 'pre-wrap';
            textDisplay.textContent = allExtractedText.trim();
            
            progressDiv.appendChild(textDisplay);
            
            // Store extracted text for later use
            window.extractedOCRText = allExtractedText.trim();
            
            // Add instruction message and AI search button
            const instructionMsg = document.createElement('div');
            instructionMsg.innerHTML = `
                <div style="margin-top: 15px; padding: 10px; background-color: #f0f8ff; border: 1px solid #b0d4f1; border-radius: 5px; margin-bottom: 15px">
                    <p style="margin: 0 0 10px 0; font-weight: bold;">OCR text extracted successfully!</p>
                    <p style="margin: 0 0 15px 0;">Enter ISBN, Author (Last name,First name) or Title if needed for more accurate results, then click the button below to generate metadata with AI.</p>
                    <button id="ai-search-btn" style="
                        background-color: #4CAF50; 
                        color: white; 
                        padding: 10px 20px; 
                        border: none; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        font-size: 14px;
                        font-weight: bold;
                    ">🤖 Generate Metadata with AI</button>
                    <i class="info-icon" data-tooltip="Use this option to search by image of the item to be catalogued. Enter ISBN, Author (Last name,First name) or Title if needed for more accurate results, then click the button below to generate metadata with AI">ⓘ</i>
                </div>
            `;
            
            progressDiv.appendChild(instructionMsg);
            
            // Add click handler for the AI search button
            document.getElementById('ai-search-btn').onclick = function() {
                generateMetadataWithAI();
            };
        }
    };

    fileInput.click();
}

// New function to handle AI metadata generation with user input
function generateMetadataWithAI() {
    const aiSearchBtn = document.getElementById('ai-search-btn');
    const progressDiv = document.getElementById('ocr-progress');
    
    if (!window.extractedOCRText) {
        alert('No OCR text available. Please upload and process images first.');
        return;
    }
    
    // Disable button and show processing
    aiSearchBtn.disabled = true;
    aiSearchBtn.innerHTML = '🔄 Generating Metadata...';
    
    // Get additional user inputs
    const title = document.getElementById('title').value.trim();
    const familyName = document.getElementById('family_name').value.trim();
    const givenName = document.getElementById('given_name').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    
    // Prepare enhanced query for AI
    let enhancedQuery = window.extractedOCRText;
    
    // Add user-provided details if available
    const additionalInfo = [];
    if (title) additionalInfo.push(`Title: ${title}`);
    if (familyName || givenName) {
        const author = `${givenName} ${familyName}`.trim();
        additionalInfo.push(`Author: ${author}`);
    }
    if (isbn) additionalInfo.push(`ISBN: ${isbn}`);
    
    if (additionalInfo.length > 0) {
        enhancedQuery = `Additional provided information:\n${additionalInfo.join('\n')}\n\nExtracted OCR Text:\n${window.extractedOCRText}`;
    }
    
    console.log('Enhanced query for AI:', enhancedQuery);
    
    // Add processing message
    const processingMsg = document.createElement('div');
    processingMsg.id = 'ai-processing-msg';
    processingMsg.textContent = 'Analyzing text with additional details for book metadata...';
    processingMsg.style.marginTop = '10px';
    processingMsg.style.fontStyle = 'italic';
    processingMsg.style.color = '#666';
    
    // Remove any existing processing message
    const existingMsg = document.getElementById('ai-processing-msg');
    if (existingMsg) existingMsg.remove();
    
    progressDiv.appendChild(processingMsg);
    
    // Send enhanced query to Perplexity for analysis
    fetchFromPerplexity(enhancedQuery)
        .then(perplexityData => {
            if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
                try {
                    const metadata = JSON.parse(perplexityData.choices[0].message.content);
                    console.log('Book metadata from enhanced AI search:', metadata);
                    
                    processingMsg.textContent = '✅ Successfully generated book metadata with AI!';
                    processingMsg.style.color = '#4CAF50';
                    processingMsg.style.fontWeight = 'bold';
                    
                    // Populate form fields with the metadata
                    document.getElementById('title').value = metadata.title || '';
                    document.getElementById('isbn').value = metadata.isbn || '';
                    document.getElementById('edition').value = metadata.edition || '';
                    document.getElementById('language').value = metadata.language || '';
                    document.getElementById('pages').value = metadata.numberOfPages || '';
                    document.getElementById('dimensions').value = metadata.dimensions || '';
                    document.getElementById('subtitle').value = metadata.subtitle || '';

                    // NEW: Handle transliteration fields
                    const translitTitleField = document.getElementById('translit_title');
                    const translitSubtitleField = document.getElementById('translit_subtitle');

                    if (metadata.translit_title) {
                        translitTitleField.value = metadata.translit_title;
                        translitTitleField.style.display = 'inline-block';
                    } else {
                        translitTitleField.style.display = 'none';
                    }

                    if (metadata.translit_subtitle) {
                        translitSubtitleField.value = metadata.translit_subtitle;
                        translitSubtitleField.style.display = 'inline-block';
                    } else {
                        translitSubtitleField.style.display = 'none';
                    }


                    document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                        ? metadata.placeOfPublication[0]
                        : (metadata.placeOfPublication || '');

                    document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                        ? metadata.publisher[0]
                        : (metadata.publisher || '');

                    document.getElementById('year').value = metadata.publicationDate || '';
                    document.getElementById('notes').value = metadata.synopsisOfBook || '';

                    if (metadata.authors?.length > 0) {
                        document.getElementById('family_name').value = metadata.authors[0].familyName || '';
                        document.getElementById('given_name').value = metadata.authors[0].givenName || '';
                    }

                    // Handle country dropdown
                    const countrySelect = document.querySelector('select[name="country"]');
                    if (countrySelect && metadata.publicationCountry) {
                        Array.from(countrySelect.options).forEach(option => {
                            if (option.text.toLowerCase() === metadata.publicationCountry.toLowerCase()) {
                                countrySelect.value = option.value;
                            }
                        });
                    }
                    
                } catch (error) {
                    console.error('Error parsing Perplexity content:', error);
                    processingMsg.textContent = '❌ Error parsing book metadata from AI response.';
                    processingMsg.style.color = '#f44336';
                }
            } else {
                processingMsg.textContent = '❌ Could not identify book metadata from the provided information.';
                processingMsg.style.color = '#f44336';
            }
        })
        .catch(error => {
            console.error('Error analyzing text with Perplexity:', error);
            processingMsg.textContent = '❌ Error connecting to AI service for metadata generation.';
            processingMsg.style.color = '#f44336';
        })
        .finally(() => {
            // Re-enable button
            aiSearchBtn.disabled = false;
            aiSearchBtn.innerHTML = '🤖 Generate Metadata with AI';
        });
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;
                const maxDim = 2000; // Maximum dimension
                
                if (width > height && width > maxDim) {
                    height *= maxDim / width;
                    width = maxDim;
                } else if (height > maxDim) {
                    width *= maxDim / height;
                    height = maxDim;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob with compression
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.7); // Adjust quality (0.7 = 70% quality)
            };
            
            img.onerror = function(error) {
                reject(error);
            };
        };
        
        reader.onerror = function(error) {
            reject(error);
        };
    });
} 


/*function ocrSearch() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true; // Enable multiple file selection

    fileInput.onchange = async function (e) {
        const files = Array.from(e.target.files); // Convert FileList to Array
        if (!files || files.length === 0) return;

        console.log(`Processing ${files.length} image(s)...`);
        
        const progressDiv = document.getElementById('ocr-progress');
        if (progressDiv) {
            progressDiv.innerHTML = `Processing ${files.length} image(s) with OCR...`;
        }

        let allExtractedText = ''; // Store text from all images
        let processedCount = 0;

        // Process each image sequentially
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Processing image ${i + 1}/${files.length}:`, file.name);
            console.log('Original size:', file.size / 1024 / 1024, 'MB');

            try {
                const compressedImage = await compressImage(file);
                console.log('Compressed size:', compressedImage.size / 1024 / 1024, 'MB');

                const formData = new FormData();
                formData.append('image', compressedImage, file.name);

                // Update progress
                if (progressDiv) {
                    progressDiv.innerHTML = `Processing image ${i + 1}/${files.length}: ${file.name}...`;
                }

                const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/ocr', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log(`OCR Result for image ${i + 1}:`, result);

                if (result.success && result.result && result.result.ParsedResults) {
                    const extractedText = result.result.ParsedResults[0].ParsedText;
                    console.log(`Extracted Text from image ${i + 1}:`, extractedText);
                    
                    // Combine text from all images with separators
                    allExtractedText += `\n\n--- Text from ${file.name} ---\n${extractedText}`;
                    processedCount++;
                } else {
                    console.error(`OCR failed for image ${i + 1}: ${file.name}`);
                    allExtractedText += `\n\n--- Failed to extract text from ${file.name} ---\n`;
                }

            } catch (error) {
                console.error(`Error processing image ${i + 1}:`, error);
                allExtractedText += `\n\n--- Error processing ${file.name}: ${error.message} ---\n`;
            }
        }

        // Display results after processing all images
        if (progressDiv) {
            progressDiv.innerHTML = `OCR completed for ${processedCount}/${files.length} image(s). Extracted text:`;
            
            const textDisplay = document.createElement('div');
            textDisplay.style.maxHeight = '200px'; // Increased height for multiple images
            textDisplay.style.overflow = 'auto';
            textDisplay.style.border = '1px solid #ccc';
            textDisplay.style.padding = '10px';
            textDisplay.style.marginTop = '10px';
            textDisplay.style.whiteSpace = 'pre-wrap'; // Preserve formatting
            textDisplay.textContent = allExtractedText.trim();
            
            progressDiv.appendChild(textDisplay);
            
            // Add a processing message
            const processingMsg = document.createElement('div');
            processingMsg.textContent = 'Analyzing combined text for book metadata...';
            processingMsg.style.marginTop = '10px';
            processingMsg.style.fontStyle = 'italic';
            progressDiv.appendChild(processingMsg);
            
            // Send combined text to Perplexity for analysis
            if (allExtractedText.trim()) {
                fetchFromPerplexity(allExtractedText)
                    .then(perplexityData => {
                        if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
                            try {
                                // Parse the JSON string from the content
                                const metadata = JSON.parse(perplexityData.choices[0].message.content);
                                console.log('Book metadata from combined OCR:', metadata);
                                
                                // Update the processing message
                                processingMsg.textContent = 'Found book metadata from combined images!';
                                
                                // Populate form fields with the metadata
                                document.getElementById('title').value = metadata.title || '';
                                document.getElementById('edition').value = metadata.edition || '';
                                document.getElementById('language').value = metadata.language || '';
                                document.getElementById('pages').value = metadata.numberOfPages || '';
                                document.getElementById('dimensions').value = metadata.dimensions || '';
                                document.getElementById('subtitle').value = metadata.subtitle || '';
        
                                document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                                    ? metadata.placeOfPublication[0]
                                    : (metadata.placeOfPublication || '');
        
                                document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                                    ? metadata.publisher[0]
                                    : (metadata.publisher || '');
        
                                document.getElementById('year').value = metadata.publicationDate || '';
                                document.getElementById('notes').value = metadata.synopsisOfBook || '';
        
                                if (metadata.authors?.length > 0) {
                                    document.getElementById('family_name').value = metadata.authors[0].familyName || '';
                                    document.getElementById('given_name').value = metadata.authors[0].givenName || '';
                                }
        
                                // Handle country dropdown
                                const countrySelect = document.querySelector('select[name="country"]');
                                if (countrySelect && metadata.publicationCountry) {
                                    Array.from(countrySelect.options).forEach(option => {
                                        if (option.text.toLowerCase() === metadata.publicationCountry.toLowerCase()) {
                                            countrySelect.value = option.value;
                                        }
                                    });
                                }
                                
                            } catch (error) {
                                console.error('Error parsing Perplexity content:', error);
                                processingMsg.textContent = 'Error parsing book metadata.';
                            }
                        } else {
                            processingMsg.textContent = 'Could not identify book metadata from the combined text.';
                        }
                    })
                    .catch(error => {
                        console.error('Error analyzing combined text with Perplexity:', error);
                        processingMsg.textContent = 'Error analyzing text for book information.';
                    });
            } else {
                processingMsg.textContent = 'No text was successfully extracted from any image.';
            }
        }
    };

    fileInput.click();
}*/