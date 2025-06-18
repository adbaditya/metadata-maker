function processImages() {
    console.log('IMS Template Loaded');
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


async function preFetchFromAI() {
    const title = document.getElementById('title').value; // Name of Item
    const serial = document.getElementById('serial').value; // Serial No

    if (!title && !serial) {
        console.log('Please enter either a title or serial number');
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

        // Dummy eBay API call (always fails/returns no data)
        console.log('Attempting eBay API call...');
        try {
            // This is a dummy call that will fail/return no data
            const ebayResponse = await fetch('https://dummy-ebay-api.com/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, serial })
            });
            // This will always fail, so we'll catch and continue to Perplexity
        } catch (ebayError) {
            console.log('eBay API unavailable, proceeding to Perplexity search...');
        }

        // Perplexity search for equipment
        console.log('Searching Perplexity for equipment data...');
        let searchQuery = title;
        if (serial) {
            searchQuery = `${title} serial number ${serial}`;
        }

        const perplexityData = await fetchFromPerplexityEquipment(searchQuery);
        if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
            try {
                metadata = JSON.parse(perplexityData.choices[0].message.content);
                console.log('Parsed equipment metadata:', metadata);
            } catch (error) {
                console.error('Error parsing Perplexity content:', error);
            }
        }

        // Populate form fields if we have metadata
        if (metadata) {
            console.log('Final Equipment Metadata:', metadata);
            
            // Populate equipment-specific fields
            document.getElementById('title').value = metadata.title || '';
            document.getElementById('subtitle').value = metadata.subtitle || '';
            document.getElementById('manufacturer').value = metadata.manufacturer || '';
            document.getElementById('serial').value = metadata.serial || serial; // Keep original if not found
            document.getElementById('dimensions').value = metadata.dimensions || '';
            document.getElementById('notes').value = metadata.notes || '';
            document.getElementById('product_manual').value = metadata.productLink;
            
            // Handle manufacturer country dropdown
            const countrySelect = document.querySelector('select[name="country"]'); // Your country dropdown
            if (countrySelect && metadata.manufacturerCountry) {
                Array.from(countrySelect.options).forEach(option => {
                    if (option.text.toLowerCase().includes(metadata.manufacturerCountry.toLowerCase())) {
                        countrySelect.value = option.value;
                    }
                });
            }
            
            // Handle product manual/site link
            if (metadata.productLink) {
                // You can display this or store it in a hidden field
                console.log('Product link found:', metadata.productLink);
                // If you have a field for this:
                // document.getElementById('product_link').value = metadata.productLink;
            }
        }

    } catch (error) {
        console.error('Error fetching equipment data:', error);
    }
}

async function fetchFromPerplexityEquipment(searchQuery) {
    try {
        const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/perplexity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `Find comprehensive equipment/product metadata for: "${searchQuery}". 
                
                Search these sources in order of priority:
                1. Manufacturer's official website
                2. Amazon.com / Amazon.ae / Amazon.in product listings
                3. eBay completed listings
                4. Ubuy.ae electronics/equipment section
                5. Noon.com electronics
                6. Equipment specification databases
                7. Product manual repositories
                8. Technical specification sites

                Return the data in this exact JSON format:
                {
                    "title": "Product/Equipment name",
                    "subtitle": "Model number or variant",
                    "manufacturer": "Manufacturer company name",
                    "manufacturerCountry": "Country where manufactured",
                    "serial": "Serial number if found, otherwise null",
                    "dimensions": "Physical dimensions in cm format (L x W x H)",
                    "notes": "Product description, key features, or technical summary",
                    "productLink": "Link to product manual, specification sheet, or official product page"
                }
                
                Search instructions:
                1. Look for official product pages first
                2. Cross-reference with retailer listings for specifications
                3. Find product manuals or specification sheets
                4. Convert all measurements to centimeters
                5. Provide comprehensive product description in notes
                6. Find official documentation links when possible
                
                Use null for truly unknown values only after thorough searching.
                Only return the JSON and nothing else. Do not start with "json", just return the JSON.
                Remove any citation indicators like [1][2][3] from the response.`
            })
        });

        const data = await response.json();
        console.log('Perplexity Equipment Response:', data);

        if (data && data.success && data.result) {
            if (data.result.choices &&
                data.result.choices[0] &&
                data.result.choices[0].message &&
                data.result.choices[0].message.content) {

                let content = data.result.choices[0].message.content;
                content = content.replace(/```json\n*/g, '').replace(/```/g, '').trim();

                try {
                    const parsedData = JSON.parse(content);
                    console.log('Successfully parsed equipment data:', parsedData);
                    return { choices: [{ message: { content: JSON.stringify(parsedData) } }] };
                } catch (parseError) {
                    console.error('Error parsing equipment data:', parseError);
                    console.log('Content that failed to parse:', content);
                }
            }
        }
        return null;
    } catch (error) {
        console.error('Perplexity Equipment API error:', error);
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