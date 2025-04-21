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

        const img = document.createElement('img');
        img.style.maxWidth = '200px';
        img.style.margin = '10px';

        const nameLabel = document.createElement('div');
        nameLabel.textContent = file.name;
        nameLabel.className = 'file-name';

        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
        };

        previewContainer.appendChild(img);
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

/*async function preFetchFromAI() {
    const title = document.getElementById('title').value;
    const isbn = document.getElementById('isbn').value;

    if (!title && !isbn) {
        console.log('Please enter either a title or ISBN');
        return;
    }

    let prompt = '';
    if (title) {
        prompt = `Find book metadata for the title: "${title}"`;
    } else if (isbn) {
        prompt = `Find book metadata for ISBN: ${isbn}`;
    }

    try {
    const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that provides book metadata in JSON format. Only return data that you are certain is accurate. If any information is unavailable or uncertain, use null for that field. Always include these exact fields: title, isbn, edition, language, publisher, authors (array of objects with familyName and givenName), placeOfPublication, numberOfPages. If you cannot find reliable information for a requested book, return a JSON object with all fields set to null along with a message field explaining the issue."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
    });

        const data = await response.json();
        console.log('AI Response:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const metadata = JSON.parse(data.choices[0].message.content);
            console.log('Parsed Metadata:', metadata);

            // Populate form fields
            document.getElementById('title').value = metadata.title || '';
            document.getElementById('edition').value = metadata.edition || '';
            document.getElementById('language').value = metadata.language || '';
            document.getElementById('pages').value = metadata.numberOfPages || '';
            document.getElementById('place').value = metadata.placeOfPublication || '';
            document.getElementById('publisher').value = metadata.publisher || '';

            // Handle authors
            if (metadata.authors && metadata.authors.length > 0) {
                document.getElementById('family_name').value = metadata.authors[0].familyName || '';
                document.getElementById('given_name').value = metadata.authors[0].givenName || '';
            }
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}*/

//Working v2
/*async function preFetchFromAI() {
    const title = document.getElementById('title').value;
    const isbn = document.getElementById('isbn').value;

    if (!title && !isbn) {
        console.log('Please enter either a title or ISBN');
        return;
    }

    try {
        // Get data from both Open Library endpoints
        let openLibraryData = null;
        let isbnData = null;
        let searchQuery = isbn || title;

        // First API call - search
        const olResponse = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}`);
        openLibraryData = await olResponse.json();
        console.log('Open Library Search API Response:', openLibraryData);

        // Second API call - ISBN specific
        if (isbn) {
            const isbnResponse = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
            isbnData = await isbnResponse.json();
            console.log('Open Library ISBN API Response:', isbnData);
        }

        // Combine both data sources
        const combinedData = {
            searchData: openLibraryData,
            isbnData: isbnData
        };
        console.log('Combined Data:', combinedData);

        // Now send combined data to OpenAI
        const prompt = `Here is the Open Library data for this book:
        Search API data: ${JSON.stringify(openLibraryData)}
        ISBN API data: ${JSON.stringify(isbnData)}
        Based on this combined data, please provide the book metadata in the required format. For the publicationCountry field, please extract only the country name from the place of publication data. If a city or state is provided without a country, try to determine the country based on context.`;

        const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that provides book metadata in JSON format. Use the provided Open Library data when available to ensure accuracy. Only return data that you are certain is accurate. If any information is unavailable or uncertain, use null for that field. For arrays of places or publishers, provide them as arrays but ensure they are deduplicated. For dates, provide them in YYYY format. For countries, provide the full country name (e.g., 'Netherlands' instead of 'ne'). Always include these exact fields: title, isbn, edition, language, publisher, authors (array of objects with familyName and givenName), placeOfPublication, publicationCountry, publicationDate, copyrightDate, numberOfPages."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        });

        const data = await response.json();
        console.log('AI Response:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
            const metadata = JSON.parse(data.choices[0].message.content);
            console.log('Final Metadata:', metadata);

            // Populate form fields
            document.getElementById('title').value = metadata.title || '';
            document.getElementById('edition').value = metadata.edition || '';
            document.getElementById('language').value = metadata.language || '';
            document.getElementById('pages').value = metadata.numberOfPages || '';

            // Take first value if placeOfPublication is an array
            document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                ? metadata.placeOfPublication[0]
                : (metadata.placeOfPublication || '');

            // Handle publisher array
            document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                ? metadata.publisher[0]
                : (metadata.publisher || '');

            // Add new fields
            document.getElementById('country').value = metadata.publicationCountry || '';
            document.getElementById('year').value = metadata.publicationDate || '';
            //document.getElementById('copyright').value = metadata.copyrightDate || '';

            // Handle authors - make sure we extract both family and given names
            if (metadata.authors && metadata.authors.length > 0) {
                const author = metadata.authors[0];
                document.getElementById('family_name').value = author.familyName || '';
                document.getElementById('given_name').value = author.givenName || '';

                // If there's a dropdown for author type, set it to "author"
                const authorTypeSelect = document.querySelector('select[value="author"]');
                if (authorTypeSelect) {
                    authorTypeSelect.value = 'author';
                }
            }

            if (metadata.publicationCountry) {
                const countrySelect = document.querySelector('select[name="country"]'); // adjust selector based on your actual dropdown name
                if (countrySelect) {
                    // Find and select the option that matches the country
                    const options = Array.from(countrySelect.options);
                    const matchingOption = options.find(option =>
                        option.text.toLowerCase() === metadata.publicationCountry.toLowerCase()
                    );
                    if (matchingOption) {
                        countrySelect.value = matchingOption.value;
                    }
                }
            }

            // Handle country dropdown
            const countrySelect = document.querySelector('select[name="country"]'); // adjust selector based on your dropdown
            if (countrySelect) {
                Array.from(countrySelect.options).forEach(option => {
                    if (option.text.toLowerCase() === 'netherlands') {
                        countrySelect.value = option.value;
                    }
                });
            }
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}*/

//v3 - with perplexity
async function preFetchFromAI() {
    const title = document.getElementById('title').value;
    const isbn = document.getElementById('isbn').value;

    if (!title && !isbn) {
        console.log('Please enter either a title or ISBN');
        return;
    }

    try {
        let metadata = null;

        // If we have a title but no ISBN, try Perplexity first
        if (title && !isbn) {
            console.log('Title-only search, trying Perplexity first...');
            const perplexityData = await fetchFromPerplexity(title);
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
                }

                // If OpenLibrary has data, process it through OpenAI
                if ((openLibraryData?.docs?.length > 0) || isbnData) {
                    const combinedData = {
                        searchData: openLibraryData,
                        isbnData: isbnData
                    };
                    console.log('Combined Data:', combinedData);

                    const prompt = `Here is the Open Library data for this book:
                    Search API data: ${JSON.stringify(openLibraryData)}
                    ISBN API data: ${JSON.stringify(isbnData)}
                    Based on this combined data, please provide the book metadata in the required format.`;

                    const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/openai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: "gpt-4o",
                            messages: [
                                {
                                    "role": "system",
                                    "content": "You are a helpful assistant that provides book metadata in JSON format. Use the provided Open Library data when available to ensure accuracy. Only return data that you are certain is accurate. If any information is unavailable or uncertain, use null for that field. For arrays of places or publishers, provide them as arrays but ensure they are deduplicated. For dates, provide them in YYYY format. For countries, provide the full country name (e.g., 'Netherlands' instead of 'ne'). Always include these exact fields: title, subtitle, isbn, edition, language, publisher, authors (array of objects with familyName and givenName), placeOfPublication, publicationCountry, publicationDate, copyrightDate, numberOfPages, synopsisOfBook."
                                },
                                {
                                    "role": "user",
                                    "content": prompt
                                }
                            ]
                        })
                    });

                    const data = await response.json();
                    if (data.choices?.[0]?.message) {
                        metadata = JSON.parse(data.choices[0].message.content);
                    }
                }
            } catch (error) {
                console.log('OpenLibrary error, falling back to Perplexity:', error);
                // Fall back to Perplexity
                const searchTerm = title || `ISBN: ${isbn}`;
                const perplexityData = await fetchFromPerplexity(searchTerm);
                if (perplexityData?.choices?.[0]?.message?.content) {
                    metadata = JSON.parse(perplexityData.choices[0].message.content);
                }
            }
        }

        // If we have metadata from either source, populate the form
        if (metadata) {
            console.log('Final Metadata:', metadata);
            // Populate form fields
            document.getElementById('title').value = metadata.title || '';
            document.getElementById('edition').value = metadata.edition || '';
            document.getElementById('language').value = metadata.language || '';
            document.getElementById('pages').value = metadata.numberOfPages || '';
            document.getElementById('subtitle').value = metadata.subtitle || '';

            document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                ? metadata.placeOfPublication[0]
                : (metadata.placeOfPublication || '');

            document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                ? metadata.publisher[0]
                : (metadata.publisher || '');

            document.getElementById('year').value = metadata.publicationDate || '';
            document.getElementById('synopsis-text').value = metadata.synopsisOfBook || '';

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
                query: `Find comprehensive book metadata for the book titled: "${title}". 
                    Search publisher websites, library databases, and book retailer sites.
                    For each field, explicitly state if you found the information or not.
                    Return the data in this exact JSON format: {
                    "title": "Full book title",
                    "subtitle": "Book subtitle or null",
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
                    "synopsisOfBook": Synopsis of the book
                    }
                    Use null for truly unknown values only after thorough searching. Only return the json and nothing else. Do not start with words json, just return the json and nothing else.`
            })
        });

        const data = await response.json();
        console.log('Perplexity Response:', data);

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
                    // Parse the cleaned JSON string
                    const parsedData = JSON.parse(content);
                    console.log('Successfully parsed Perplexity data:', parsedData);
                    return { choices: [{ message: { content: JSON.stringify(parsedData) } }] };
                } catch (parseError) {
                    console.error('Error parsing cleaned content:', parseError);
                    console.log('Content that failed to parse:', content);
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

    fileInput.onchange = async function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            console.log('Uploading image for OCR...');
            const progressDiv = document.getElementById('ocr-progress');
            if (progressDiv) {
                progressDiv.innerHTML = 'Processing image with OCR...';
            }

            const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/ocr', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log('OCR Result:', result);

            if (result.success && result.result && result.result.ParsedResults) {
                const extractedText = result.result.ParsedResults[0].ParsedText;
                console.log('Extracted Text:', extractedText);

                if (progressDiv) {
                    progressDiv.innerHTML = 'OCR completed. Extracted text:';
                    
                    const textDisplay = document.createElement('div');
                    textDisplay.style.maxHeight = '150px';
                    textDisplay.style.overflow = 'auto';
                    textDisplay.style.border = '1px solid #ccc';
                    textDisplay.style.padding = '10px';
                    textDisplay.style.marginTop = '10px';
                    textDisplay.textContent = extractedText;
                    
                    progressDiv.appendChild(textDisplay);
                    
                    // Add a processing message
                    const processingMsg = document.createElement('div');
                    processingMsg.textContent = 'Analyzing text for book metadata...';
                    processingMsg.style.marginTop = '10px';
                    processingMsg.style.fontStyle = 'italic';
                    progressDiv.appendChild(processingMsg);
                    
                    // Send to Perplexity for analysis
                    fetchFromPerplexity(extractedText)
                        .then(perplexityData => {
                            if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
                                try {
                                    // Parse the JSON string from the content
                                    const metadata = JSON.parse(perplexityData.choices[0].message.content);
                                    console.log('Book metadata from OCR:', metadata);
                                    
                                    // Update the processing message
                                    processingMsg.textContent = 'Found book metadata!';
                                    
                                    // Populate form fields with the metadata
                                    document.getElementById('title').value = metadata.title || '';
                                    document.getElementById('edition').value = metadata.edition || '';
                                    document.getElementById('language').value = metadata.language || '';
                                    document.getElementById('pages').value = metadata.numberOfPages || '';
                                    document.getElementById('subtitle').value = metadata.subtitle || '';
            
                                    document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                                        ? metadata.placeOfPublication[0]
                                        : (metadata.placeOfPublication || '');
            
                                    document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                                        ? metadata.publisher[0]
                                        : (metadata.publisher || '');
            
                                    document.getElementById('year').value = metadata.publicationDate || '';
                                    document.getElementById('synopsis-text').value = metadata.synopsisOfBook || '';
            
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
                                processingMsg.textContent = 'Could not identify book metadata from the text.';
                            }
                        })
                        .catch(error => {
                            console.error('Error analyzing text with Perplexity:', error);
                            processingMsg.textContent = 'Error analyzing text for book information.';
                        });
                }
            } else {
                console.error('OCR failed or no text extracted');
                if (progressDiv) {
                    progressDiv.innerHTML = 'OCR failed or no text extracted from image';
                }
            }
        } catch (error) {
            console.error('Error during OCR process:', error);
            const progressDiv = document.getElementById('upload-progress');
            if (progressDiv) {
                progressDiv.innerHTML = `OCR error: ${error.message}`;
            }
        }
    };

    fileInput.click();
}