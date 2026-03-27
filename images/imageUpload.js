let aiProcessingInProgress = false;

// Returns JSON schema field for translated_title based on currently selected translation language
function getTranslationSchemaField() {
    var lang = (document.getElementById('translation_language') || {}).value || '';
    if (lang) {
        return '"translated_title": "The book title translated into ' + lang + '"';
    }
    return '"translated_title": null';
}

let originalButtonStates = {};

function showAIProcessingState() {
    if (aiProcessingInProgress) return;
    aiProcessingInProgress = true;

    // Store and lock main AI button
    const aiButton = document.getElementById('ai-generate-btn');
    if (aiButton) {
        originalButtonStates['ai-generate-btn'] = {
            innerHTML: aiButton.innerHTML,
            disabled: aiButton.disabled
        };
        aiButton.disabled = true;
        aiButton.classList.add('ai-processing');
        aiButton.innerHTML = '🔄 Processing...';
    }

    // Store and lock OCR AI button
    const aiSearchBtn = document.getElementById('ai-search-btn');
    if (aiSearchBtn) {
        originalButtonStates['ai-search-btn'] = {
            innerHTML: aiSearchBtn.innerHTML,
            disabled: aiSearchBtn.disabled
        };
        aiSearchBtn.disabled = true;
        aiSearchBtn.classList.add('ai-processing');
        aiSearchBtn.innerHTML = '🔄 Processing...';
    }

    // Show notification (existing code)
    const notification = document.createElement('div');
    notification.id = 'ai-processing-notification';
    notification.className = 'ai-processing-notification';
    notification.innerHTML = `
        <div class="ai-processing-spinner"></div>
        <span>AI is analyzing and generating metadata...</span>
    `;
    document.body.appendChild(notification);
    console.log('AI processing state activated');
}

function hideAIProcessingState(success = true) {
    aiProcessingInProgress = false;

    // Restore main AI button
    const aiButton = document.getElementById('ai-generate-btn');
    if (aiButton && originalButtonStates['ai-generate-btn']) {
        aiButton.disabled = false;
        aiButton.classList.remove('ai-processing');
        aiButton.innerHTML = originalButtonStates['ai-generate-btn'].innerHTML;
        aiButton.style.position = '';
    }

    // Restore OCR AI button
    const aiSearchBtn = document.getElementById('ai-search-btn');
    if (aiSearchBtn && originalButtonStates['ai-search-btn']) {
        aiSearchBtn.disabled = false;
        aiSearchBtn.classList.remove('ai-processing');
        aiSearchBtn.innerHTML = originalButtonStates['ai-search-btn'].innerHTML;
        aiSearchBtn.style.position = '';
    }

    // Clear stored states
    originalButtonStates = {};

    // Hide notification (existing code)
    const notification = document.getElementById('ai-processing-notification');
    if (notification) {
        notification.remove();
    }

    if (success) {
        showSuccessNotification('✅ Metadata generated successfully!');
    }

    console.log(`AI processing state deactivated (success: ${success})`);
}

function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'ai-processing-notification';
    notification.style.background = '#4CAF50';
    notification.innerHTML = `<span>${message}</span>`;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 3000);

    console.log('Success notification shown:', message);
}

function showAIErrorPopup(errorMessage, canRetry = true) {
    // Create error popup
    const backdrop = document.createElement('div');
    backdrop.className = 'ai-error-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const popup = document.createElement('div');
    popup.className = 'ai-error-popup';
    popup.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        margin: 20px;
        text-align: center;
        border: 2px solid #ff4444;
        animation: popupSlideIn 0.3s ease-out;
    `;

    let retryButton = '';
    if (canRetry) {
        retryButton = `
            <button id="ai-retry-btn" style="
                background: #4CAF50; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">🔄 Try Again</button>
        `;
    }

    popup.innerHTML = `
        <h3 style="color: #ff4444; margin-top: 0;">⚠️ AI Processing Error</h3>
        <p style="margin: 15px 0; color: #333; line-height: 1.5;">
            ${errorMessage}
        </p>
        <div style="margin: 20px 0;">
            ${retryButton}
            <button id="ai-manual-btn" style="
                background: #2196F3; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">✏️ Enter Manually</button>
            <button id="ai-close-btn" style="
                background: #666; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">❌ Close</button>
        </div>
    `;

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);

    // Add event listeners
    if (canRetry) {
        document.getElementById('ai-retry-btn').onclick = function () {
            backdrop.remove();
            //preFetchFromAI(); // Retry the AI generation
        };
    }

    document.getElementById('ai-manual-btn').onclick = function () {
        backdrop.remove();
        document.getElementById('title').focus();
    };

    document.getElementById('ai-close-btn').onclick = function () {
        backdrop.remove();
    };

    // Close on backdrop click
    backdrop.onclick = function (e) {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    };

    console.log('AI error popup shown:', errorMessage);
}

function showOCRParseFailedPopup(message) {
    const backdrop = document.createElement('div');
    backdrop.className = 'json-error-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const popup = document.createElement('div');
    popup.className = 'json-error-popup';
    popup.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        margin: 20px;
        text-align: center;
        border: 2px solid #ff4444;
    `;

    popup.innerHTML = `
        <h3 style="color: #ff4444; margin-top: 0;">⚠️ OCR AI Processing Failed</h3>
        <p style="margin: 15px 0; color: #333; line-height: 1.5;">
            ${message}<br><br>
            The OCR text analysis could not be completed. You can:
        </p>
        <div style="margin: 20px 0;">
            <button id="ocr-retry-btn" style="
                background: #4CAF50; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">🔄 Try OCR Analysis Again</button>
            <button id="manual-btn" style="
                background: #2196F3; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">✏️ Enter Manually</button>
            <button id="close-btn" style="
                background: #666; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">❌ Close</button>
        </div>
    `;

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);

    // ✅ OCR-specific retry - calls generateMetadataWithAI, not preFetchFromAI
    document.getElementById('ocr-retry-btn').onclick = function () {
        backdrop.remove();
        generateMetadataWithAI(); // ✅ Retry OCR processing
    };

    document.getElementById('manual-btn').onclick = function () {
        backdrop.remove();
        document.getElementById('title').focus();
    };

    document.getElementById('close-btn').onclick = function () {
        backdrop.remove();
    };

    backdrop.onclick = function (e) {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    };
}

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

function simpleJSONExtract(content) {
    try {
        console.log('Simple JSON extraction attempting...');

        // Method 1: Find JSON between first { and last }
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');

        if (start !== -1 && end !== -1 && end > start) {
            const jsonStr = content.substring(start, end + 1);
            console.log('Extracted JSON string:', jsonStr.substring(0, 100) + '...');

            try {
                const parsed = JSON.parse(jsonStr);
                console.log('✅ Simple extraction method 1 succeeded');
                return parsed;
            } catch (parseError) {
                console.log('❌ Simple extraction method 1 failed:', parseError.message);
            }
        }

        // Method 2: Try to find JSON with regex pattern
        const jsonPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
        const matches = content.match(jsonPattern);

        if (matches && matches.length > 0) {
            // Try the largest match first (most likely to be complete)
            const sortedMatches = matches.sort((a, b) => b.length - a.length);

            for (const match of sortedMatches) {
                try {
                    const parsed = JSON.parse(match);
                    console.log('✅ Simple extraction method 2 succeeded');
                    return parsed;
                } catch (parseError) {
                    console.log('❌ Simple extraction method 2 failed for match:', parseError.message);
                    continue;
                }
            }
        }

        // Method 3: Try to clean common AI response patterns
        let cleaned = content
            // Remove markdown code blocks
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            // Remove common AI prefixes
            .replace(/^.*?(?=\{)/s, '')
            // Remove everything after the last }
            .replace(/\}[\s\S]*$/s, '}')
            // Remove citation numbers [1], [2], etc.
            .replace(/\[\d+\]/g, '')
            // Remove extra whitespace
            .trim();

        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
            try {
                const parsed = JSON.parse(cleaned);
                console.log('✅ Simple extraction method 3 succeeded');
                return parsed;
            } catch (parseError) {
                console.log('❌ Simple extraction method 3 failed:', parseError.message);
            }
        }

        console.log('❌ All simple extraction methods failed');
        return null;

    } catch (error) {
        console.error('❌ Simple JSON extraction error:', error);
        return null;
    }
}

function tryParseWithFallbacks(content) {
    console.log('Attempting to parse JSON with fallbacks...');

    // Method 1: Direct JSON.parse
    try {
        const result = JSON.parse(content);
        console.log('✅ Method 1 (direct parsing) succeeded');
        return result;
    } catch (error) {
        console.log('❌ Method 1 (direct parsing) failed:', error.message);
    }

    // Method 2: Enhanced extraction
    try {
        const result = extractJSONFromResponse(content);
        if (result) {
            console.log('✅ Method 2 (enhanced extraction) succeeded');
            return result;
        }
    } catch (error) {
        console.log('❌ Method 2 (enhanced extraction) failed:', error.message);
    }

    // Method 3: Simple regex extraction
    try {
        const result = simpleJSONExtract(content);
        if (result) {
            console.log('✅ Method 3 (regex extraction) succeeded');
            return result;
        }
    } catch (error) {
        console.log('❌ Method 3 (regex extraction) failed:', error.message);
    }

    // All methods failed
    console.error('❌ All JSON parsing methods failed');
    return null;
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

function cleanISBN(isbn) {
    if (!isbn) return '';

    const cleaned = isbn.replace(/[^0-9X]/g, '');

    if (cleaned.length === 10 || cleaned.length === 13) {
        return cleaned;
    }

    console.warn('Invalid ISBN length:', cleaned.length);
    return cleaned;
}

document.getElementById('isbn').addEventListener('input', function (e) {
    const originalValue = e.target.value;
    const cleanedValue = cleanISBN(originalValue);

    if (originalValue !== cleanedValue) {
        e.target.value = cleanedValue;
    }
});

// Helper Functions

function evaluateOCRQuality(extractedText) {
    if (!extractedText || extractedText.trim().length < 5) {
        return { isGood: false, reason: "Too short or empty" };
    }

    // Check for meaningful patterns
    const bookIndicators = [
        /isbn/i, /author/i, /title/i, /publisher/i, /edition/i, /copyright/i,
        /\b\d{13}\b/, /\b\d{10}\b/, // ISBN patterns
        /\d{4}/, // Years
        /by\s+[A-Z][a-z]+/i, // "by Author"
        /[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}/ // Proper names
    ];

    // Count meaningful words (not garbled like "eee aaa")
    const words = extractedText.split(/\s+/);
    const meaningfulWords = words.filter(word =>
        word.length > 2 &&
        /^[a-zA-Z0-9\-'.,;:!?]+$/.test(word) &&
        !/(ee|aa|oo){2,}/.test(word.toLowerCase()) // Avoid "eee", "aaa" patterns
    );

    // Calculate quality score
    const meaningfulRatio = meaningfulWords.length / words.length;
    const hasBookIndicators = bookIndicators.some(pattern => pattern.test(extractedText));
    const hasProperStructure = /[.!?]/.test(extractedText); // Has sentence structure

    const isGood = meaningfulRatio > 0.6 && (hasBookIndicators || hasProperStructure);

    return {
        isGood,
        score: meaningfulRatio,
        meaningfulWords: meaningfulWords.length,
        totalWords: words.length,
        hasBookIndicators,
        reason: isGood ? "Good quality" : "Low quality or garbled text"
    };
}

async function convertImagesToBase64(files) {
    const base64Images = [];

    for (const file of files) {
        try {
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            base64Images.push({
                filename: file.name,
                data: base64
            });
        } catch (error) {
            console.error(`Failed to convert ${file.name} to base64:`, error);
        }
    }

    return base64Images;
}

async function fetchFromPerplexityWithImages(textQuery, base64Images = []) {
    try {
        console.log('🔍 Sending request to worker:', {
            hasText: !!textQuery,
            imageCount: base64Images.length
        });

        const requestBody = {
            query: textQuery
        };

        // Add images if provided
        if (base64Images && base64Images.length > 0) {
            requestBody.images = base64Images;
            console.log('📸 Including images in request');
        }

        const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/perplexity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log('Perplexity Response:', data);

        // Check for error first
        if (data.error || !data.success) {
            console.error('❌ Perplexity API Error:', data.error);

            // If multi-modal fails, try text-only fallback
            if (base64Images.length > 0) {
                console.log('🔄 Multi-modal failed, trying text-only fallback...');
                return await fetchFromPerplexityWithImages(textQuery, []); // Retry without images
            }

            return { error: 'api_error', message: data.error?.message || 'API request failed' };
        }

        if (data && data.success && data.result) {
            if (data.result.choices &&
                data.result.choices[0] &&
                data.result.choices[0].message &&
                data.result.choices[0].message.content) {

                let responseContent = data.result.choices[0].message.content;
                responseContent = responseContent.replace(/```json\n*/g, '').replace(/```/g, '').trim();

                try {
                    const parsedData = JSON.parse(responseContent);
                    console.log('✅ Successfully parsed multi-modal response:', parsedData);
                    return {
                        choices: [{ message: { content: JSON.stringify(parsedData) } }],
                        citations: data.result.citations,
                        isMultiModal: base64Images.length > 0
                    };
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    console.log('Raw content:', responseContent);
                    return { error: 'parse_error', message: 'Could not parse response' };
                }
            }
        }

        return { error: 'no_content', message: 'No valid content in response' };

    } catch (error) {
        console.error('Network error:', error);

        // Fallback to text-only on network errors
        if (base64Images.length > 0) {
            console.log('🔄 Network error, trying text-only fallback...');
            return await fetchFromPerplexityWithImages(textQuery, []);
        }

        return { error: 'network_error', message: error.message };
    }
}

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

function extractJSONFromResponse(content) {
    try {
        // First, try parsing as-is
        return JSON.parse(content);
    } catch (error) {
        console.log('Direct parsing failed, trying to extract JSON...');

        // Remove citation-style explanations (- **field**: explanation format)
        let cleaned = content
            .replace(/\n- \*\*.*?\*\*:.*$/gm, '')
            .replace(/\[\d+\]/g, '')
            .trim();

        const startBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');

        if (startBrace !== -1 && lastBrace !== -1 && lastBrace > startBrace) {
            const jsonStr = cleaned.substring(startBrace, lastBrace + 1);

            try {
                return JSON.parse(jsonStr);
            } catch (error2) {
                console.log('Extracted JSON parsing failed:', error2);
            }
        }

        // Fallback: try cleaning more aggressively
        cleaned = content
            .replace(/^.*?(?=\{)/s, '')
            .replace(/\}[\s\S]*$/s, '}')
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/\[\d+\]/g, '')
            .trim();

        try {
            return JSON.parse(cleaned);
        } catch (error3) {
            console.error('All JSON extraction methods failed');
            console.log('Original content:', content);
            return null;
        }
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
    if (aiProcessingInProgress) {
        return;
    }

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

    showAIProcessingState();

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
                    hideAIProcessingState(false);
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
                    const originalISBN = isbn;
                    isbn = cleanISBN(isbn);
                    console.log(`ISBN cleaned: "${originalISBN}" → "${isbn}"`);
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

                //prompt
                const enhancedQuery = `
                    Book search with multiple data sources:
                    Title: ${title || 'Not provided'}
                    ISBN: ${isbn || 'Not provided'}
                    Author: ${[given_name, family_name].filter(Boolean).join(' ') || 'Not provided'}

                    OpenLibrary Search Data: ${JSON.stringify(openLibraryData)}
                    OpenLibrary ISBN Data: ${JSON.stringify(isbnData)}

                    Please analyze ALL this information from OpenLibrary along with fresh searches from Amazon, bookstores, and other sources to provide the most accurate and complete book metadata. Use OpenLibrary data as reference but prioritize more complete information from current retail sources for fields. 
                    Prefer the source which mentions product dimensions and pages or book length or print length to be most accurate

                    CRITICAL TRANSLITERATION RULES:
                    - If title/subtitle contains ANY non-Latin characters (Arabic, Hindi, Chinese, Russian, etc.), you MUST provide BOTH fields
                    - Original field: Keep the original script
                    - Translit field: Provide romanized version using Latin alphabet
                    - Example: Title: "الأسود يليق بك", translit_title: "Al-Aswad Yaleeq Bik"
                    - If text is already in Latin script, set translit_title to null
                    
                    Find comprehensive book metadata for the book titled: "${title}". 
                    Primary search sources/citations (in order of priority):
                    1. Amazon.com - Look for complete product details including dimensions of the book
                    2. Amazon.ae / Amazon.in
                    3. Ubuy.ae
                    4. Barnes & Noble (barnesandnoble.com)
                    5. Book Depository (bookdepository.com)
                    6. Jamalon.com
                    7. Noon.com books section

                    Secondary sources if needed:
                    - Publisher's official website - PRIORITY for product dimensions and specifications
                    - WorldCat.org
                    - Goodreads.com
                    - Google Books

                    PAGE COUNT REQUIREMENT: Only use page numbers explicitly stated in:
                    - Amazon product details ("Print length: X pages")
                    - Publisher specifications
                    - Official bookstore listings
                    - Library catalog records (WorldCat, etc.)
                    - Google Books "About this book" section

                    DO NOT estimate pages based on book thickness, genre, or other books by the same author. If no exact page count is found in verified sources, return null.

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
                    "placeOfPublication": ["City of publciation or where the book was published"],
                    "publicationCountry": "Full country name",
                    "publicationDate": "YYYY format",
                    "copyrightDate": "YYYY format or null",
                    "numberOfPages": "Exact page count as a number (e.g., 256) found in product listings, publisher data, or book specifications. Look specifically for 'Pages:', 'Page Count:', 'Length:', or 'Print Length:' in source materials. If page count not explicitly stated in any verified source, return null. DO NOT estimate or calculate page count - only use exact numbers from official sources.",
                    "dimensions": "Book dimensions in centimeters using format: Length x Width x Height (e.g., 22.86 x 15.24 x 3.00). Convert from inches/other units to cm if needed (1 inch = 2.54 cm). Search specifically for 'Product Dimensions', 'Book Dimensions', or 'Size' in product listings. If no dimensions found in any source, return empty string. CRITICAL: Only use dimensions from verified product pages or publisher specifications - do not estimate or guess.",
                    "synopsisOfBook": "Book synopsis written in the SAME LANGUAGE as the original title (e.g. if title is Hindi write synopsis in Hindi, if Arabic write in Arabic, if English write in English)",
                    ${getTranslationSchemaField()}
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
                    IMPORTANT: Prioritize the sources which has dimensions, page length and complete product details. Only return JSON, no other text and remove citations indications (ie [1][2][3]etc).
                    CRITICAL: Return ONLY the JSON object. No text before or after. No explanations. No citations like [1][2]. Just pure JSON.
                    `;


                const perplexityData = await fetchFromPerplexity(enhancedQuery);
                if (perplexityData?.choices?.[0]?.message?.content) {
                    // Check if it's an error response (no citations, etc.)
                    if (perplexityData.error) {
                        console.log(`Perplexity failed: ${perplexityData.error} - ${perplexityData.message}`);
                        throw new Error(`Perplexity validation failed: ${perplexityData.error}`);
                    }

                    if (perplexityData?.choices?.[0]?.message?.content) {
                        const content = perplexityData.choices[0].message.content;
                        content = content.replace(/```json\n*/g, '').replace(/```/g, '').trim();

                        try {
                            const parsedData = JSON.parse(content);
                            console.log('✅ Successfully parsed Perplexity data:', parsedData);

                            // ✅ NEW: Only warn about citations, don't throw error
                            if (!perplexityData.citations || perplexityData.citations.length === 0) {
                                console.log('⚠️ No citations, but got valid JSON response');
                            }

                            return {
                                choices: [{ message: { content: JSON.stringify(parsedData) } }],
                                citations: perplexityData.citations || [] // Include empty array if no citations
                            };
                        } catch (parseError) {
                            console.error('Error parsing cleaned content:', parseError);
                            throw new Error('Could not parse response');
                        }
                    } else {
                        throw new Error('No valid content in response');
                    }

                    metadata = JSON.parse(perplexityData.choices[0].message.content);
                    console.log('✅ Enhanced metadata from Perplexity with valid citations:', metadata);
                    hideAIProcessingState(true);
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
                                //prompt
                                const contextQuery = `
                                I found this book information from ISBN database:
                                Find comprehensive book metadata for the book with these details:
                                - Title: ${isbnData.title || 'Unknown'}
                                - Author: ${isbnData.author || 'Unknown'}
                                - ISBN: ${isbn}

                    Prefer the source which mentions product dimensions and pages or book length or print length to be most accurate
                    
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

                    PAGE COUNT REQUIREMENT: Only use page numbers explicitly stated in:
                    - Amazon product details ("Print length: X pages")
                    - Publisher specifications
                    - Official bookstore listings
                    - Library catalog records (WorldCat, etc.)
                    - Google Books "About this book" section

                    DO NOT estimate pages based on book thickness, genre, or other books by the same author. If no exact page count is found in verified sources, return null.
                    
                    Return data in this exact JSON format:
                    {
                        "title": "Full book title",
                        "translit_title": "Transliterated title if original is non-English, otherwise null",
                        "subtitle": "Full Subtitle of the book, otherwise null",
                        "translit_subtitle": "Transliterated subtitle if original is non-English, otherwise null",
                        "isbn": "ISBN of the book if found, otherwise null",
                        "edition": "Edition information of the book or null",
                        "language": "Language code of the book (eng, fre, etc.)",
                        "publisher": ["Publisher name of the book"],
                        "authors": [{"familyName": "Last name of author", "givenName": "First name of author"}],
                        "placeOfPublication": ["City of publciation or where the book was published"],
                        "publicationCountry": "Full country name of publication",
                        "publicationDate": "YYYY format of publication date",
                        "copyrightDate": "YYYY format or copyright date",
                        "numberOfPages": "Exact page count as a number (e.g., 256) found in product listings, publisher data, or book specifications. Look specifically for 'Pages:', 'Page Count:', 'Length:', or 'Print Length:' in source materials. If page count not explicitly stated in any verified source, return null. DO NOT estimate or calculate page count - only use exact numbers from official sources.",
                        "dimensions": "Book dimensions in centimeters using format: Length x Width x Height (e.g., 22.86 x 15.24 x 3.00). Convert from inches/other units to cm if needed (1 inch = 2.54 cm). Search specifically for 'Product Dimensions', 'Book Dimensions', or 'Size' in product listings. If no dimensions found in any source, return empty string. CRITICAL: Only use dimensions from verified product pages or publisher specifications - do not estimate or guess.",
                        "synopsisOfBook": "Book synopsis written in the SAME LANGUAGE as the original title",
                        ${getTranslationSchemaField()}
                    }

                    Only return JSON, nothing else.
                    CRITICAL: Return ONLY the JSON object. No text before or after. No explanations. No citations like [1][2]. Just pure JSON.
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
                        const title = document.getElementById('title').value;
                        const familyName = document.getElementById("#family_name").value;
                        const givenName = document.getElementById("#given_name").value;
                        const isbn = document.getElementById("isbn").value;

                        //prompt
                        const enhancedQuery = `
                            Book search with multiple data sources:
                            Title: ${title || 'Not provided'}
                            ISBN: ${isbn || 'Not provided'}
                            Author: ${[given_name, family_name].filter(Boolean).join(' ') || 'Not provided'}

                            OpenLibrary Search Data: ${JSON.stringify(openLibraryData)}
                            OpenLibrary ISBN Data: ${JSON.stringify(isbnData)}

                            Please analyze ALL this information from OpenLibrary along with fresh searches from Amazon, bookstores, and other sources to provide the most accurate and complete book metadata. Use OpenLibrary data as reference but prioritize more complete information from current retail sources for fields. 
                            Prefer the source which mentions product dimensions and pages or book length or print length to be most accurate
                            
                            Find comprehensive book metadata for the book titled: "${title}". 
                            Primary search sources/citations (in order of priority):
                            1. Amazon.com - Look for complete product details including dimensions of the book
                            2. Amazon.ae / Amazon.in
                            3. Ubuy.ae
                            4. Barnes & Noble (barnesandnoble.com)
                            5. Book Depository (bookdepository.com)
                            6. Jamalon.com
                            7. Noon.com books section

                            Secondary sources if needed:
                            - Publisher's official website - PRIORITY for product dimensions and specifications
                            - WorldCat.org
                            - Goodreads.com
                            - Google Books

                            PAGE COUNT REQUIREMENT: Only use page numbers explicitly stated in:
                            - Amazon product details ("Print length: X pages")
                            - Publisher specifications
                            - Official bookstore listings
                            - Library catalog records (WorldCat, etc.)
                            - Google Books "About this book" section

                            DO NOT estimate pages based on book thickness, genre, or other books by the same author. If no exact page count is found in verified sources, return null.

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
                            "placeOfPublication": ["City of publciation or where the book was published"],
                            "publicationCountry": "Full country name",
                            "publicationDate": "YYYY format",
                            "copyrightDate": "YYYY format or null",
                            "numberOfPages": "Exact page count as a number (e.g., 256) found in product listings, publisher data, or book specifications. Look specifically for 'Pages:', 'Page Count:', 'Length:', or 'Print Length:' in source materials. If page count not explicitly stated in any verified source, return null. DO NOT estimate or calculate page count - only use exact numbers from official sources.",
                            "dimensions": "Book dimensions in centimeters using format: Length x Width x Height (e.g., 22.86 x 15.24 x 3.00). Convert from inches/other units to cm if needed (1 inch = 2.54 cm). Search specifically for 'Product Dimensions', 'Book Dimensions', or 'Size' in product listings. If no dimensions found in any source, return empty string. CRITICAL: Only use dimensions from verified product pages or publisher specifications - do not estimate or guess.",
                            "synopsisOfBook": "Book synopsis written in the SAME LANGUAGE as the original title (e.g. if title is Hindi write synopsis in Hindi, if Arabic write in Arabic, if English write in English)",
                            ${getTranslationSchemaField()}
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
                            IMPORTANT: Prioritize the sources which has dimensions, page length and complete product details. Only return JSON, no other text and remove citations indications (ie [1][2][3]etc).
                            CRITICAL: Return ONLY the JSON object. No text before or after. No explanations. No citations like [1][2]. Just pure JSON.
                            `;

                        fetchFromPerplexity(enhancedQuery)
                            .then(perplexityData => {
                                if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
                                    try {
                                        const metadata = tryParseWithFallbacks(perplexityData.choices[0].message.content);

                                        if (metadata && !metadata.error) {

                                            // Use your existing form population code
                                            document.getElementById('title').value = metadata.title || '';
                                            document.getElementById('isbn').value = metadata.isbn || '';
                                            document.getElementById('edition').value = metadata.edition || '';
                                            document.getElementById('language').value = metadata.language || '';
                                            document.getElementById('pages').value = metadata.numberOfPages || '';
                                            document.getElementById('dimensions').value = metadata.dimensions || '';
                                            document.getElementById('subtitle').value = metadata.subtitle || '';

                                            const translitTitleField = document.getElementById('translit_title');
                                            const translitSubtitleField = document.getElementById('translit_subtitle');

                                            if (translitTitleField) {
                                                if (metadata.translit_title && metadata.translit_title.trim() !== '') {
                                                    translitTitleField.value = metadata.translit_title;

                                                    const translitTitleBlock = document.getElementById('translit-title-block');
                                                    if (translitTitleBlock) {
                                                        translitTitleBlock.classList.remove('hidden');
                                                    }

                                                    translitTitleField.classList.remove('hidden');
                                                    translitTitleField.style.display = 'inline-block';
                                                    translitTitleField.style.visibility = 'visible';

                                                } else {
                                                    const translitTitleBlock = document.getElementById('translit-title-block');
                                                    if (translitTitleBlock) {
                                                        translitTitleBlock.classList.add('hidden');
                                                    }
                                                    translitTitleField.value = '';
                                                }
                                            }

                                            if (translitSubtitleField) {
                                                if (metadata.translit_subtitle && metadata.translit_subtitle.trim() !== '') {
                                                    translitSubtitleField.value = metadata.translit_subtitle;

                                                    const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
                                                    if (translitSubtitleBlock) {
                                                        translitSubtitleBlock.classList.remove('hidden');
                                                    }

                                                    translitSubtitleField.classList.remove('hidden');
                                                    translitSubtitleField.style.display = 'inline-block';
                                                    translitSubtitleField.style.visibility = 'visible';

                                                } else {
                                                    const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
                                                    if (translitSubtitleBlock) {
                                                        translitSubtitleBlock.classList.add('hidden');
                                                    }
                                                    translitSubtitleField.value = '';
                                                }
                                            }

                                            document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                                                ? metadata.placeOfPublication[0]
                                                : (metadata.placeOfPublication || '');

                                            document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                                                ? metadata.publisher[0]
                                                : (metadata.publisher || '');

                                            document.getElementById('year').value = metadata.publicationDate || '';
                                            document.getElementById('notes').value = metadata.synopsisOfBook || '';

                                            var translationTitleField = document.getElementById('translation_title');
                                            var translationBlock = document.getElementById('translation-title-block');
                                            if (translationTitleField && metadata.translated_title && metadata.translated_title !== 'null' && metadata.translated_title.trim() !== '') {
                                                translationTitleField.value = metadata.translated_title;
                                                if (translationBlock) translationBlock.classList.remove('hidden');
                                            }

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

                                            hideAIProcessingState(true);

                                        } else {
                                            showJSONParseFailedPopup('Could not parse enhanced search results.');
                                            hideAIProcessingState(false);
                                        }
                                    } catch (parseError) {
                                        console.error('Error parsing enhanced search:', parseError);
                                        showJSONParseFailedPopup('Error parsing enhanced search results.');
                                    }
                                } else {
                                    showJSONParseFailedPopup('No valid response from enhanced search.');
                                }
                            })
                            .catch(error => {
                                console.error('Enhanced search failed:', error);
                                showJSONParseFailedPopup('All search methods failed. Please enter details manually.');
                                hideAIProcessingState(false);
                            });
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
                        hideAIProcessingState(false);
                        alert('No search criteria provided. Please enter title, author, or ISBN.');
                        return;
                    }

                    const searchTerm = searchDetails.join(', ');
                    console.log('Comprehensive search term:', searchTerm);

                    //prompt
                    const enhancedQuery = `
                    Find comprehensive book metadata for the book with these details: ${searchTerm}
                    
                    Search major bookstores for this exact title and author combination.
                    
                    Primary search sources (in order of priority):
                    1. Amazon.com / Amazon.ae / Amazon.in - PRIORITY for product dimensions and specifications
                    2. Google Books
                    3. WorldCat.org
                    4. Barnes & Noble (barnesandnoble.com)
                    5. Book Depository (bookdepository.com)
                    6. Ubuy.ae
                    7. Jamalon.com
                    8. Noon.com books section
                    
                    PAGE COUNT REQUIREMENT: Only use page numbers explicitly stated in:
                    - Amazon product details ("Print length: X pages")
                    - Publisher specifications
                    - Official bookstore listings
                    - Library catalog records (WorldCat, etc.)
                    - Google Books "About this book" section

                    DO NOT estimate pages based on book thickness, genre, or other books by the same author. If no exact page count is found in verified sources, return null.

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
                        "placeOfPublication": ["City of publciation or where the book was published"],
                        "publicationCountry": "Full country name",
                        "publicationDate": "YYYY format",
                        "copyrightDate": "YYYY format or null",
                        "numberOfPages": "Exact page count as a number (e.g., 256) found in product listings, publisher data, or book specifications. Look specifically for 'Pages:', 'Page Count:', 'Length:', or 'Print Length:' in source materials. If page count not explicitly stated in any verified source, return null. DO NOT estimate or calculate page count - only use exact numbers from official sources.",
                        "dimensions": "Book dimensions in centimeters using format: Length x Width x Height (e.g., 22.86 x 15.24 x 3.00). Convert from inches/other units to cm if needed (1 inch = 2.54 cm). Search specifically for 'Product Dimensions', 'Book Dimensions', or 'Size' in product listings. If no dimensions found in any source, return empty string. CRITICAL: Only use dimensions from verified product pages or publisher specifications - do not estimate or guess.",
                        "synopsisOfBook": "Book synopsis written in the SAME LANGUAGE as the original title",
                        ${getTranslationSchemaField()}
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
                                hideAIProcessingState(false);
                                alert('Book not found in any database. Please enter details manually.');
                                return;
                            } else {
                                console.log('Found metadata via title/author search:', metadata);
                            }
                        } catch (parseError) {
                            hideAIProcessingState(false);
                            console.error('Error parsing title-based response:', parseError);
                            alert('Error parsing search results. Please enter details manually.');
                            return;
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

            const translitTitleField = document.getElementById('translit_title');
            const translitSubtitleField = document.getElementById('translit_subtitle');

            if (translitTitleField) {
                if (metadata.translit_title && metadata.translit_title.trim() !== '') {
                    translitTitleField.value = metadata.translit_title;

                    const translitTitleBlock = document.getElementById('translit-title-block');
                    if (translitTitleBlock) {
                        translitTitleBlock.classList.remove('hidden');
                    }

                    translitTitleField.classList.remove('hidden');
                    translitTitleField.style.display = 'inline-block';
                    translitTitleField.style.visibility = 'visible';

                } else {
                    const translitTitleBlock = document.getElementById('translit-title-block');
                    if (translitTitleBlock) {
                        translitTitleBlock.classList.add('hidden');
                    }
                    translitTitleField.value = '';
                }
            }

            if (translitSubtitleField) {
                if (metadata.translit_subtitle && metadata.translit_subtitle.trim() !== '') {
                    translitSubtitleField.value = metadata.translit_subtitle;

                    const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
                    if (translitSubtitleBlock) {
                        translitSubtitleBlock.classList.remove('hidden');
                    }

                    translitSubtitleField.classList.remove('hidden');
                    translitSubtitleField.style.display = 'inline-block';
                    translitSubtitleField.style.visibility = 'visible';

                } else {
                    const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
                    if (translitSubtitleBlock) {
                        translitSubtitleBlock.classList.add('hidden');
                    }
                    translitSubtitleField.value = '';
                }
            }

            document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
                ? metadata.placeOfPublication[0]
                : (metadata.placeOfPublication || '');

            document.getElementById('publisher').value = Array.isArray(metadata.publisher)
                ? metadata.publisher[0]
                : (metadata.publisher || '');

            document.getElementById('year').value = metadata.publicationDate || '';
            document.getElementById('cyear').value = metadata.copyrightDate || '';
            document.getElementById('notes').value = metadata.synopsisOfBook || '';

            var translationTitleField = document.getElementById('translation_title');
            var translationBlock = document.getElementById('translation-title-block');
            if (translationTitleField && metadata.translated_title && metadata.translated_title !== 'null' && metadata.translated_title.trim() !== '') {
                translationTitleField.value = metadata.translated_title;
                if (translationBlock) translationBlock.classList.remove('hidden');
            }

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

            hideAIProcessingState(true);

        }

    } catch (error) {
        console.error('Error fetching data:', error);
        hideAIProcessingState(false);
        showAIErrorPopup(error.message, true);
    }
}

async function fetchFromPerplexity(title) {
    try {
        const response = await fetch('https://metadata-maker.adb-aditya.workers.dev/perplexity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            //prompt
            body: JSON.stringify({
                query: `Find comprehensive book metadata for the book with these details: "${title}". 
Map data such as print length and dimensions from ALL cited source pages, not just publisher sites.
Search all sources for listings with the ISBN provided, regardless of edition or regional variation, to ensure all editions are considered for metadata.
Always check the 'Product Details' or 'Product Information' boxes on bookstore and Amazon product pages for specifications, including page count and product dimensions.
After searching all listed primary and secondary sources for the provided ISBN and title, map each required metadata field (page count, dimensions, etc.) from every URL found (including all Amazon domains and publisher pages). Do not stop at the publisher site if key data is missing—continue to scan all search results for product details boxes and field labels such as 'Print length', 'Dimensions', and 'Pages' in the full content of every cited site. If multiple values are found, prefer Amazon product details boxes for dimensions and page count, else use the publisher or next available source. Always include which URL/source each field was found at, for traceability.
Primary search sources (in order of priority):
1. Amazon.com / Amazon.in / Amazon.co.uk / Amazon.ae / Amazon.jp (all Amazon domains checked for ISBN/product) — HIGHEST priority for product dimensions/specifications
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

**ENHANCED DATA EXTRACTION REQUIREMENTS:**

PAGE COUNT REQUIREMENT: Only use page numbers explicitly stated in:
- Amazon product details ("Print length: X pages", "314 pages", "Kindle Edition: X pages")
- Publisher specifications
- Official bookstore listings
- Library catalog records (WorldCat, etc.)
- Google Books "About this book" section

**Look specifically for patterns like: "314 pages", "Print length: 314", "Pages: 314"**
DO NOT estimate pages based on book thickness, genre, or other books by the same author. If no exact page count is found in verified sources, return null.

**DIMENSIONS EXTRACTION REQUIREMENT:**
Book dimensions in centimeters using format: Length x Width x Height (e.g., 22.86 x 15.24 x 3.00). Convert from inches/other units to cm if needed (1 inch = 2.54 cm). 

**Search specifically for these terms in Amazon/bookstore listings:**
- "Dimensions: X x Y x Z cm" 
- "Product Dimensions"
- "Item dimensions" 
- "15.6 x 1.88 x 23.4 cm" (look for exact patterns like this)

If no dimensions found in any source, return empty string. CRITICAL: Only use dimensions from verified product pages or publisher specifications - do not estimate or guess.

**AMAZON SEARCH MANDATE:** 
You MUST search Amazon.com, Amazon.in, or Amazon.ae for this book. Amazon listings typically contain the most complete product specifications including page counts and dimensions. Ensure Amazon URLs appear in your citations.

For each field, explicitly state if you found the information or not.
for mapping the data to the json combine all the data from all the citations
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
"placeOfPublication": ["City of publciation or where the book was published"],
"publicationCountry": "Full country name",
"publicationDate": "YYYY format",
"copyrightDate": "YYYY format or null",
"numberOfPages": "Exact page count as a number (e.g., 256) found in product listings, publisher data, or book specifications. Look specifically for 'Pages:', 'Page Count:', 'Length:', or 'Print Length:' in source materials. If page count not explicitly stated in any verified source, return null. DO NOT estimate or calculate page count - only use exact numbers from official sources.",
"dimensions": "Book dimensions in centimeters using format: Length x Width x Height (e.g., 22.86 x 15.24 x 3.00). Convert from inches/other units to cm if needed (1 inch = 2.54 cm). Search specifically for 'Product Dimensions', 'Book Dimensions', or 'Size' in product listings. If no dimensions found in any source, return empty string. CRITICAL: Only use dimensions from verified product pages or publisher specifications - do not estimate or guess.",
"synopsisOfBook": "Book synopsis written in the SAME LANGUAGE as the original title (e.g. if title is Hindi write synopsis in Hindi, if Arabic write in Arabic, if English write in English)",
${getTranslationSchemaField()}
}

IMPORTANT: If the title or subtitle contains non-English characters (Arabic, Chinese, Russian, etc.), provide both the original AND a transliterated version using Latin characters. For example:
- Original Arabic: "الأسود يليق بك"
- Transliterated: "Al-Aswad Yaleeq Bik"

Use null for truly unknown values only after thorough searching. Only return the json and nothing else. Do not start with words json, just return the json and nothing else.

Search instructions:
1. Give priority to Amazon.com/Amazon.ae listings - PRIORITY for product dimensions and specifications
   **CRITICAL: Ensure you actually search Amazon and include Amazon URLs in citations**
2. Cross-reference with Ubuy.ae
3. Check other primary sources in order
4. Only use secondary sources if data is missing
5. Include citation for each piece of information found
6. Convert all measurements to centimeters
7. Use null only when information cannot be found in ANY source listed

**VERIFICATION CHECKLIST BEFORE RESPONDING:**
✓ Did you search Amazon with the book title/ISBN?
✓ Are there Amazon URLs in your citations?
✓ Did you find page count from product listings?
✓ Did you find dimensions from product specifications?
✓ Are you returning exact numbers, not estimates?

Only return the json and nothing else. Do not start with words json, just return the json and nothing else and remove citations indications (ie [1][2][3]etc).`
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

/*function ocrSearch() {
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

        // Process each image sequentially with Tesseract.js
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Processing image ${i + 1}/${files.length}:`, file.name);

            try {
                if (progressDiv) {
                    progressDiv.innerHTML = `Processing image ${i + 1}/${files.length}: ${file.name}...`;
                }

                // Use Tesseract.js to extract text
                const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            if (progressDiv) {
                                progressDiv.innerHTML = `Processing image ${i + 1}/${files.length}: ${file.name} (${progress}%)...`;
                            }
                        }
                    }
                });

                console.log(`Extracted Text from image ${i + 1}:`, text);

                if (text.trim()) {
                    allExtractedText += `\n\n--- Text from ${file.name} ---\n${text.trim()}`;
                    processedCount++;
                } else {
                    console.log(`No text found in image ${i + 1}: ${file.name}`);
                    allExtractedText += `\n\n--- No text found in ${file.name} ---\n`;
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
            document.getElementById('ai-search-btn').onclick = function () {
                if (aiProcessingInProgress) {
                    return;
                }
                //showAIProcessingState();
                generateMetadataWithAI();
            };
        }
    };

    fileInput.click();
}*/

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

        // Store original files for later use
        window.ocrImageFiles = files;

        // Process each image sequentially with Tesseract.js
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`Processing image ${i + 1}/${files.length}:`, file.name);

            try {
                if (progressDiv) {
                    progressDiv.innerHTML = `Processing image ${i + 1}/${files.length}: ${file.name}...`;
                }

                const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            if (progressDiv) {
                                progressDiv.innerHTML = `Processing image ${i + 1}/${files.length}: ${file.name} (${progress}%)...`;
                            }
                        }
                    }
                });

                console.log(`Extracted Text from image ${i + 1}:`, text);

                if (text.trim()) {
                    allExtractedText += `\n\n--- Text from ${file.name} ---\n${text.trim()}`;
                    processedCount++;
                } else {
                    console.log(`No text found in image ${i + 1}: ${file.name}`);
                    allExtractedText += `\n\n--- No text found in ${file.name} ---\n`;
                }

            } catch (error) {
                console.error(`Error processing image ${i + 1}:`, error);
                allExtractedText += `\n\n--- Error processing ${file.name}: ${error.message} ---\n`;
            }
        }

        // Evaluate OCR quality
        const qualityCheck = evaluateOCRQuality(allExtractedText);
        console.log('OCR Quality Assessment:', qualityCheck);

        // Display results with quality assessment
        if (progressDiv) {
            let statusMessage = '';
            let statusColor = '';

            if (qualityCheck.isGood) {
                statusMessage = `✅ OCR completed for ${processedCount}/${files.length} image(s). Text quality: Good`;
                statusColor = '#4CAF50';
                window.extractedOCRText = allExtractedText.trim();
                window.ocrQuality = 'good';
            } else {
                statusMessage = `⚠️ OCR completed for ${processedCount}/${files.length} image(s). Text quality: Poor (${qualityCheck.reason})`;
                statusColor = '#ff9800';
                window.extractedOCRText = allExtractedText.trim();
                window.ocrQuality = 'poor';
            }

            progressDiv.innerHTML = `<div style="color: ${statusColor}; font-weight: bold;">${statusMessage}</div>`;

            // Show extracted text
            const textDisplay = document.createElement('div');
            textDisplay.style.maxHeight = '200px';
            textDisplay.style.overflow = 'auto';
            textDisplay.style.border = '1px solid #ccc';
            textDisplay.style.padding = '10px';
            textDisplay.style.marginTop = '10px';
            textDisplay.style.whiteSpace = 'pre-wrap';
            textDisplay.textContent = allExtractedText.trim();
            progressDiv.appendChild(textDisplay);

            // Add instruction message and AI search button
            const instructionMsg = document.createElement('div');

            if (qualityCheck.isGood) {
                instructionMsg.innerHTML = `
                    <div style="margin-top: 15px; padding: 10px; background-color: #f0f8ff; border: 1px solid #b0d4f1; border-radius: 5px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold;">OCR text extracted successfully!</p>
                        <p style="margin: 0 0 15px 0;">Good quality text detected. Enter additional details if needed, then click below to generate metadata with AI using both text and images.</p>
                        <button id="ai-search-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">🤖 Generate Metadata with AI (Text + Images)</button>
                    </div>
                `;
            } else {
                instructionMsg.innerHTML = `
                    <div style="margin-top: 15px; padding: 10px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px;">
                        <p style="margin: 0 0 10px 0; font-weight: bold;">Low quality OCR detected</p>
                        <p style="margin: 0 0 15px 0;">Text appears garbled. AI will analyze only the images for book metadata. Enter ISBN, Author, or Title if known for better results.</p>
                        <button id="ai-search-btn" style="background-color: #ff9800; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">🤖 Generate Metadata with AI (Images Only)</button>
                    </div>
                `;
            }

            progressDiv.appendChild(instructionMsg);

            // Add click handler for the AI search button
            document.getElementById('ai-search-btn').onclick = function () {
                if (aiProcessingInProgress) {
                    console.log('❌ AI processing already in progress');
                    return;
                }
                console.log('🔍 generateMetadataWithAI() called');
                generateMetadataWithAiImages();
            };
        }
    };

    fileInput.click();
}

function showJSONParseFailedPopup(message) {
    // Create popup elements
    const backdrop = document.createElement('div');
    backdrop.className = 'json-error-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const popup = document.createElement('div');
    popup.className = 'json-error-popup';
    popup.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        margin: 20px;
        text-align: center;
        border: 2px solid #ff4444;
    `;

    popup.innerHTML = `
        <h3 style="color: #ff4444; margin-top: 0;">⚠️ JSON Parse Failed</h3>
        <p style="margin: 15px 0; color: #333; line-height: 1.5;">
            ${message}<br><br>
            The AI response could not be processed properly. You can:
        </p>
        <div style="margin: 20px 0;">
            <button id="retry-btn" style="
                background: #4CAF50; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">🔄 Try Again</button>
            <button id="manual-btn" style="
                background: #2196F3; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">✏️ Enter Manually</button>
            <button id="close-btn" style="
                background: #666; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 5px;
                font-size: 14px;
            ">❌ Close</button>
        </div>
    `;

    backdrop.appendChild(popup);
    document.body.appendChild(backdrop);

    // Add event listeners
    document.getElementById('retry-btn').onclick = function () {
        backdrop.remove();
        //preFetchFromAI(); // Retry the entire function
    };

    document.getElementById('manual-btn').onclick = function () {
        backdrop.remove();
        // Focus on the title field to encourage manual entry
        document.getElementById('title').focus();
    };

    document.getElementById('close-btn').onclick = function () {
        backdrop.remove();
    };

    // Close on backdrop click
    backdrop.onclick = function (e) {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    };

    console.log('JSON parse failed popup shown');
}

function populateFormWithMetadata(metadata) {
    console.log('📝 Populating form with metadata:', metadata);

    // Basic fields
    document.getElementById('title').value = metadata.title || '';
    document.getElementById('isbn').value = metadata.isbn || '';
    document.getElementById('edition').value = metadata.edition || '';
    document.getElementById('language').value = metadata.language || '';
    document.getElementById('pages').value = metadata.numberOfPages || '';
    document.getElementById('dimensions').value = metadata.dimensions || '';
    document.getElementById('subtitle').value = metadata.subtitle || '';

    // Handle transliteration fields
    const translitTitleField = document.getElementById('translit_title');
    const translitSubtitleField = document.getElementById('translit_subtitle');

    if (translitTitleField) {
        if (metadata.translit_title && metadata.translit_title.trim() !== '') {
            translitTitleField.value = metadata.translit_title;

            const translitTitleBlock = document.getElementById('translit-title-block');
            if (translitTitleBlock) {
                translitTitleBlock.classList.remove('hidden');
            }

            translitTitleField.classList.remove('hidden');
            translitTitleField.style.display = 'inline-block';
            translitTitleField.style.visibility = 'visible';

        } else {
            const translitTitleBlock = document.getElementById('translit-title-block');
            if (translitTitleBlock) {
                translitTitleBlock.classList.add('hidden');
            }
            translitTitleField.value = '';
        }
    }

    if (translitSubtitleField) {
        if (metadata.translit_subtitle && metadata.translit_subtitle.trim() !== '') {
            translitSubtitleField.value = metadata.translit_subtitle;

            const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
            if (translitSubtitleBlock) {
                translitSubtitleBlock.classList.remove('hidden');
            }

            translitSubtitleField.classList.remove('hidden');
            translitSubtitleField.style.display = 'inline-block';
            translitSubtitleField.style.visibility = 'visible';

        } else {
            const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
            if (translitSubtitleBlock) {
                translitSubtitleBlock.classList.add('hidden');
            }
            translitSubtitleField.value = '';
        }
    }

    // Handle arrays
    document.getElementById('place').value = Array.isArray(metadata.placeOfPublication)
        ? metadata.placeOfPublication[0]
        : (metadata.placeOfPublication || '');

    document.getElementById('publisher').value = Array.isArray(metadata.publisher)
        ? metadata.publisher[0]
        : (metadata.publisher || '');

    // Date and notes
    document.getElementById('year').value = metadata.publicationDate || '';
    document.getElementById('cyear').value = metadata.copyrightDate || '';
    document.getElementById('notes').value = metadata.synopsisOfBook || '';

    // Handle translated title field
    var translationTitleField = document.getElementById('translation_title');
    var translationBlock = document.getElementById('translation-title-block');
    if (translationTitleField && metadata.translated_title && metadata.translated_title.trim && metadata.translated_title.trim() !== '' && metadata.translated_title !== 'null') {
        translationTitleField.value = metadata.translated_title;
        if (translationBlock) translationBlock.classList.remove('hidden');
    }

    // Authors
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

    console.log('✅ Form populated successfully');
}

async function extractBasicInfoFromImages(base64Images) {
    console.log('🔍 Stage 1: Extracting ISBN, title, author from images...');

    const quickPrompt = `You are analyzing book cover images. Look at what is VISUALLY PRESENT in the images and extract:

1. ISBN - Look for the 13-digit barcode number (usually on back cover, bottom right)
2. Title - Read the main title text from the front cover
3. Author - Read the author name from the front cover

IMPORTANT: 
- Only extract what you can SEE in the images
- Do not search the web or use external information
- If something is not visible in the image, return null for that field

Return ONLY this JSON format (no explanations, no citations):
{
    "isbn": "13-digit number if visible, otherwise null",
    "title": "Title text if visible, otherwise null",
    "author": "Author name if visible, otherwise null"
}`;

    try {
        const response = await fetchFromPerplexityWithImages(quickPrompt, base64Images);

        if (response && response.choices?.[0]?.message?.content) {
            const content = response.choices[0].message.content;
            const basicInfo = tryParseWithFallbacks(content);

            console.log('✅ Stage 1 extracted:', basicInfo);
            return basicInfo;
        }

        return null;
    } catch (error) {
        console.error('❌ Stage 1 extraction failed:', error);
        return null;
    }
}

async function generateMetadataWithAiImages() {
    console.log('🔍 generateMetadataWithAiImages() called');

    if (aiProcessingInProgress) {
        console.log('❌ AI processing already in progress');
        return;
    }

    if (!window.ocrImageFiles) {
        console.log('❌ No images available');
        alert('No images available. Please upload and process images first.');
        return;
    }

    console.log('✅ Starting AI processing with images');
    showAIProcessingState();

    const progressDiv = document.getElementById('ocr-progress');
    let processingMsg = document.getElementById('ai-processing-msg');

    if (!processingMsg) {
        processingMsg = document.createElement('div');
        processingMsg.id = 'ai-processing-msg';
        processingMsg.style.marginTop = '10px';
        processingMsg.style.fontStyle = 'italic';
        progressDiv.appendChild(processingMsg);
    }

    processingMsg.textContent = 'Analyzing images with AI for book metadata...';
    processingMsg.style.color = '#666';

    try {
        // Get user inputs
        const title = document.getElementById('title').value.trim();
        const familyName = document.getElementById('family_name').value.trim();
        const givenName = document.getElementById('given_name').value.trim();
        const isbn = document.getElementById('isbn').value.trim();

        console.log('🖼️ Converting images to base64...');
        const base64Images = await convertImagesToBase64(window.ocrImageFiles);
        console.log(`✅ Converted ${base64Images.length} images`);
        
        if (base64Images.length > 0) {
            console.log('📸 First image sample:', base64Images[0].data.substring(0, 100) + '...');
        }

        // 🔥 STAGE 1: Quick extraction from images
        processingMsg.textContent = '🔍 Stage 1: Reading ISBN, title, author from images...';
        const basicInfo = await extractBasicInfoFromImages(base64Images);

        if (!basicInfo || (!basicInfo.isbn && !basicInfo.title)) {
            throw new Error('Could not extract ISBN or title from images');
        }

        console.log('✅ Stage 1 complete:', basicInfo);

        // 🔥 NEW LOGIC: If we got ISBN, use existing ISBN search flow
        if (basicInfo.isbn && basicInfo.isbn.length >= 10) {
            console.log('📚 ISBN found! Using existing ISBN search flow for better data...');
            processingMsg.textContent = '📚 ISBN found! Searching comprehensive databases...';
            
            try {
                // Use your existing ISBN search from preFetchFromAI
                const isbnResponse = await fetch('https://metadata-maker.adb-aditya.workers.dev/isbn-search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        isbn: basicInfo.isbn
                    })
                });

                const isbnResult = await isbnResponse.json();
                console.log('ISBN search result:', isbnResult);

                if (isbnResult.success && isbnResult.data) {
                    const isbnData = isbnResult.data;
                    console.log('ISBN search data:', isbnData);

                    if (isbnData && (isbnData.title || isbnData.author)) {
                        // Now use Perplexity with ISBN context for complete metadata
                        const contextQuery = `
I found this book information from ISBN database:
Find comprehensive book metadata for the book with these details:
- Title: ${isbnData.title || 'Unknown'}
- Author: ${isbnData.author || 'Unknown'}
- ISBN: ${basicInfo.isbn}

Prefer the source which mentions product dimensions and pages or book length or print length to be most accurate

Primary search sources (in order of priority):
1. Amazon.com / Amazon.ae / Amazon.in
2. Google Books
3. WorldCat.org
4. Barnes & Noble (barnesandnoble.com)
5. Book Depository (bookdepository.com)
6. Ubay.ae
7. Jamalon.com
8. Noon.com books section
9. ThriftBooks

TRANSLITERATION RULE:
IF title contains non-Latin script (Arabic, Hindi, Chinese, etc.):
  - "title" = original script (e.g., "गोदान")
  - "translit_title" = romanized (e.g., "Godan")
IF title already in English:
  - "title" = English title
  - "translit_title" = null

PAGE COUNT REQUIREMENT: Only use page numbers explicitly stated in:
- Amazon product details ("Print length: X pages")
- Publisher specifications
- Official bookstore listings
- Library catalog records (WorldCat, etc.)
- Google Books "About this book" section

DO NOT estimate pages based on book thickness, genre, or other books by the same author. If no exact page count is found in verified sources, return null.

Return data in this exact JSON format:
{
    "title": "Full book title",
    "translit_title": "Transliterated title if original is non-English, otherwise null",
    "subtitle": "Full Subtitle of the book, otherwise null",
    "translit_subtitle": "Transliterated subtitle if original is non-English, otherwise null",
    "isbn": "ISBN of the book if found, otherwise null",
    "edition": "Edition information of the book or null",
    "language": "Language code of the book (eng, fre, etc.)",
    "publisher": ["Publisher name of the book"],
    "authors": [{"familyName": "Last name of author", "givenName": "First name of author"}],
    "placeOfPublication": ["City of publication or where the book was published"],
    "publicationCountry": "Full country name of publication",
    "publicationDate": "YYYY format of publication date",
    "copyrightDate": "YYYY format or copyright date",
    "numberOfPages": "Exact page count as a number (e.g., 256) found in product listings, publisher data, or book specifications. Look specifically for 'Pages:', 'Page Count:', 'Length:', or 'Print Length:' in source materials. If page count not explicitly stated in any verified source, return null. DO NOT estimate or calculate page count - only use exact numbers from official sources.",
    "dimensions": "Book dimensions in centimeters using format: Length x Width x Height (e.g., 22.86 x 15.24 x 3.00). Convert from inches/other units to cm if needed (1 inch = 2.54 cm). Search specifically for 'Product Dimensions', 'Book Dimensions', or 'Size' in product listings. If no dimensions found in any source, return empty string. CRITICAL: Only use dimensions from verified product pages or publisher specifications - do not estimate or guess.",
    "synopsisOfBook": "Book synopsis written in the SAME LANGUAGE as the original title",
    ${getTranslationSchemaField()}
}

Only return JSON, nothing else.
CRITICAL: Return ONLY the JSON object. No text before or after. No explanations. No citations like [1][2]. Just pure JSON.`;

                        console.log('🚀 Using ISBN-based search for complete metadata...');
                        
                        const perplexityData = await fetchFromPerplexityDirect(contextQuery);
                        
                        if (perplexityData?.choices?.[0]?.message?.content) {
                            const metadata = tryParseWithFallbacks(perplexityData.choices[0].message.content);
                            
                            if (metadata && !metadata.error) {
                                console.log('✅ Success with ISBN flow! Populating form...');
                                processingMsg.textContent = '✅ Successfully generated metadata using ISBN!';
                                processingMsg.style.color = '#4CAF50';
                                processingMsg.style.fontWeight = 'bold';

                                populateFormWithMetadata(metadata);
                                hideAIProcessingState(true);
                                return; // Exit successfully
                            }
                        }
                    }
                }
            } catch (isbnError) {
                console.log('⚠️ ISBN search failed, falling back to title/author search:', isbnError);
                // Fall through to Stage 2 below
            }
        }

        // 🔥 STAGE 2: If no ISBN or ISBN search failed, use title/author search
        processingMsg.textContent = '📚 Stage 2: Searching for complete metadata...';
        
        // Build additional context from user inputs
        const additionalInfo = [];
        if (title && title !== basicInfo.title) additionalInfo.push(`User also provided title: ${title}`);
        if (familyName || givenName) {
            const author = `${givenName} ${familyName}`.trim();
            if (author !== basicInfo.author) additionalInfo.push(`User also provided author: ${author}`);
        }
        if (isbn && isbn !== basicInfo.isbn) additionalInfo.push(`User also provided ISBN: ${isbn}`);

        // Enhanced query with Stage 1 results
        let textQuery = `You have extracted the following information from book cover images:
- ISBN: ${basicInfo.isbn || 'Not found'}
- Title: ${basicInfo.title || 'Not found'}
- Author: ${basicInfo.author || 'Not found'}

${additionalInfo.length > 0 ? `Additional context:\n${additionalInfo.join('\n')}\n\n` : ''}

IMPORTANT: The title and author may be in non-English script (Hindi: गोदान, Arabic, etc.)
- If the title is in non-English, search using both the original script AND common transliterations
- For Hindi "गोदान", also search "Godan" or "Godaan"
- For author "प्रेमचंद", also search "Premchand" or "Munshi Premchand"

Now search for COMPLETE metadata using this information.

SEARCH PRIORITY:
1. Amazon.com / Amazon.ae / Amazon.in
2. Google Books
3. WorldCat.org
4. Publisher's official website

TRANSLITERATION RULE:
IF title contains non-Latin script (Arabic, Hindi, Chinese, etc.):
  - "title" = original script (e.g., "गोदान")
  - "translit_title" = romanized (e.g., "Godan")
IF title already in English:
  - "title" = English title
  - "translit_title" = null

Return ONLY this JSON (no markdown, no explanations):
{
    "title": "${basicInfo.title || 'Title in original script'}",
    "subtitle": "Subtitle or null",
    "translit_title": "Romanized if non-Latin, else null",
    "translit_subtitle": "Romanized subtitle if non-Latin, else null",
    "isbn": "${basicInfo.isbn || 'null'}",
    "authors": [{"familyName": "Last", "givenName": "First"}],
    "publisher": ["Publisher name"],
    "edition": "Edition statement or null",
    "language": "3-letter code (eng, ara, hin)",
    "placeOfPublication": ["City name"],
    "publicationCountry": "Country name",
    "publicationDate": "YYYY",
    "copyrightDate": "YYYY or null",
    "numberOfPages": 308,
    "dimensions": "23.50 x 15.49 x 0.61",
    "synopsisOfBook": "Book synopsis written in the SAME LANGUAGE as the original title",
    ${getTranslationSchemaField()}
}`;

        console.log('🚀 Stage 2: Sending detailed search query...');
        
        // Call Perplexity for detailed search
        const perplexityData = await fetchFromPerplexity(textQuery);

        // Handle response
        if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
            const content = perplexityData.choices[0].message.content;
            console.log('📄 Stage 2 raw response:', content.substring(0, 200) + '...');

            const metadata = tryParseWithFallbacks(content);

            if (metadata && !metadata.error && (metadata.title || metadata.isbn || metadata.authors?.length > 0)) {
                console.log('✅ Success! Populating form...');
                processingMsg.textContent = '✅ Successfully generated metadata from images!';
                processingMsg.style.color = '#4CAF50';
                processingMsg.style.fontWeight = 'bold';

                populateFormWithMetadata(metadata);
                hideAIProcessingState(true);
            } else {
                throw new Error('Could not extract valid book metadata from response');
            }
        } else {
            throw new Error('No valid response from AI');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        processingMsg.textContent = '❌ Error analyzing images with AI';
        processingMsg.style.color = '#f44336';
        showOCRParseFailedPopup(`Error: ${error.message}`);
        hideAIProcessingState(false);
    }
}

function generateMetadataWithAI() {
    console.log('🔍 generateMetadataWithAI() called');

    if (aiProcessingInProgress) {
        console.log('❌ AI processing already in progress');
        return;
    }

    if (!window.extractedOCRText) {
        console.log('❌ No OCR text available');
        alert('No OCR text available. Please upload and process images first.');
        return;
    }

    console.log('✅ Starting AI processing with OCR text');

    // ✅ Use centralized state management
    showAIProcessingState();

    // Get additional user inputs
    const title = document.getElementById('title').value.trim();
    const familyName = document.getElementById('family_name').value.trim();
    const givenName = document.getElementById('given_name').value.trim();
    const isbn = document.getElementById('isbn').value.trim();

    console.log('📝 User inputs:', { title, familyName, givenName, isbn });

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

    console.log('🔍 Enhanced query prepared, length:', enhancedQuery.length);

    // Set up processing message
    const progressDiv = document.getElementById('ocr-progress');
    let processingMsg = document.getElementById('ai-processing-msg');

    if (!processingMsg) {
        processingMsg = document.createElement('div');
        processingMsg.id = 'ai-processing-msg';
        processingMsg.style.marginTop = '10px';
        processingMsg.style.fontStyle = 'italic';
        progressDiv.appendChild(processingMsg);
    }

    processingMsg.textContent = 'Analyzing OCR text with AI for book metadata...';
    processingMsg.style.color = '#666';

    console.log('🚀 Calling fetchFromPerplexity...');

    // Send enhanced query to Perplexity for analysis
    fetchFromPerplexity(enhancedQuery)
        .then(perplexityData => {
            console.log('📥 Perplexity response received:', perplexityData);

            if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
                let content = perplexityData.choices[0].message.content;
                console.log('📄 Raw Perplexity content preview:', content.substring(0, 200) + '...');

                // Try to parse with fallbacks
                const metadata = tryParseWithFallbacks(content);
                console.log('🔧 Parsed metadata:', metadata);

                if (metadata && !metadata.error) {
                    console.log('✅ Valid metadata found');

                    // Validate we got useful data
                    if (metadata.title || metadata.isbn || metadata.authors?.length > 0) {
                        console.log('✅ Useful data found, populating form');
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

                        const translitTitleField = document.getElementById('translit_title');
                        const translitSubtitleField = document.getElementById('translit_subtitle');

                        if (translitTitleField) {
                            if (metadata.translit_title && metadata.translit_title.trim() !== '') {
                                translitTitleField.value = metadata.translit_title;

                                const translitTitleBlock = document.getElementById('translit-title-block');
                                if (translitTitleBlock) {
                                    translitTitleBlock.classList.remove('hidden');
                                }

                                translitTitleField.classList.remove('hidden');
                                translitTitleField.style.display = 'inline-block';
                                translitTitleField.style.visibility = 'visible';

                            } else {
                                const translitTitleBlock = document.getElementById('translit-title-block');
                                if (translitTitleBlock) {
                                    translitTitleBlock.classList.add('hidden');
                                }
                                translitTitleField.value = '';
                            }
                        }

                        if (translitSubtitleField) {
                            if (metadata.translit_subtitle && metadata.translit_subtitle.trim() !== '') {
                                translitSubtitleField.value = metadata.translit_subtitle;

                                const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
                                if (translitSubtitleBlock) {
                                    translitSubtitleBlock.classList.remove('hidden');
                                }

                                translitSubtitleField.classList.remove('hidden');
                                translitSubtitleField.style.display = 'inline-block';
                                translitSubtitleField.style.visibility = 'visible';

                                console.log('✅ Showing translit_subtitle:', metadata.translit_subtitle);
                            } else {
                                const translitSubtitleBlock = document.getElementById('translit-subtitle-block');
                                if (translitSubtitleBlock) {
                                    translitSubtitleBlock.classList.add('hidden');
                                }
                                translitSubtitleField.value = '';
                            }
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

                        console.log('✅ Form populated, calling hideAIProcessingState(true)');
                        hideAIProcessingState(true);

                    } else {
                        console.log('⚠️ Metadata found but appears empty');
                        processingMsg.textContent = '⚠️ AI found some data but it appears incomplete.';
                        processingMsg.style.color = '#ff9800';
                        showOCRParseFailedPopup('AI returned incomplete metadata. Please verify the information and fill in missing fields manually.');
                        hideAIProcessingState(false);
                    }
                } else {
                    console.log('❌ Failed to parse metadata');
                    processingMsg.textContent = '❌ Could not parse AI response format.';
                    processingMsg.style.color = '#f44336';
                    showOCRParseFailedPopup('AI response could not be parsed. The AI might have returned an unexpected format.');
                    hideAIProcessingState(false);
                }
            } else {
                console.log('❌ No valid content in Perplexity response');
                processingMsg.textContent = '❌ Could not identify book metadata from the provided information.';
                processingMsg.style.color = '#f44336';
                showOCRParseFailedPopup('No valid response received from AI service.');
                hideAIProcessingState(false);
            }
        })
        .catch(error => {
            console.error('❌ Error in fetchFromPerplexity:', error);
            console.error('❌ Error stack:', error.stack);
            processingMsg.textContent = '❌ Error connecting to AI service for metadata generation.';
            processingMsg.style.color = '#f44336';
            showOCRParseFailedPopup(`Connection error: ${error.message}`);
            hideAIProcessingState(false);
        });
}

// New function to handle AI metadata generation with user input
/*function generateMetadataWithAI() {
    if (aiProcessingInProgress) {
        return;
    }

    if (!window.extractedOCRText) {
        hideAIProcessingState(false);
        alert('No OCR text available. Please upload and process images first.');
        return;
    }

    showAIProcessingState();

    // Disable button and show processing
    //aiSearchBtn.disabled = true;
    //aiSearchBtn.innerHTML = '🔄 Generating Metadata...';

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

    const aiSearchBtn = document.getElementById('ai-search-btn');
    const progressDiv = document.getElementById('ocr-progress');

    let processingMsg = document.getElementById('ai-processing-msg');

    if (!processingMsg) {
        processingMsg = document.createElement('div');
        processingMsg.id = 'ai-processing-msg';
        processingMsg.style.marginTop = '10px';
        processingMsg.style.fontStyle = 'italic';
        progressDiv.appendChild(processingMsg);
    }
    
    processingMsg.textContent = 'Analyzing OCR text with AI for book metadata...';
    processingMsg.style.color = '#666';

    // Remove any existing processing message
    //const existingMsg = document.getElementById('ai-processing-msg');
    //if (existingMsg) existingMsg.remove();

    //progressDiv.appendChild(processingMsg);

    // Send enhanced query to Perplexity for analysis
    fetchFromPerplexity(enhancedQuery)
        .then(perplexityData => {
            if (perplexityData && perplexityData.choices?.[0]?.message?.content) {
                let content = perplexityData.choices[0].message.content;
                console.log('Raw Perplexity content:', content);

                // Try to parse with fallbacks
                const metadata = tryParseWithFallbacks(content);

                if (metadata && !metadata.error) {
                    console.log('✅ Book metadata from enhanced AI search:', metadata);

                    // Validate we got useful data
                    if (metadata.title || metadata.isbn || metadata.authors?.length > 0) {
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

                        // Handle transliteration fields
                        const translitTitleField = document.getElementById('translit_title');
                        const translitSubtitleField = document.getElementById('translit_subtitle');

                        if (translitTitleField) {
                            if (metadata.translit_title) {
                                translitTitleField.value = metadata.translit_title;
                                translitTitleField.style.display = 'inline-block';
                            } else {
                                translitTitleField.style.display = 'none';
                            }
                        }

                        if (translitSubtitleField) {
                            if (metadata.translit_subtitle) {
                                translitSubtitleField.value = metadata.translit_subtitle;
                                translitSubtitleField.style.display = 'inline-block';
                            } else {
                                translitSubtitleField.style.display = 'none';
                            }
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

                        hideAIProcessingState(true);

                    } else {
                        // Metadata exists but appears empty
                        console.warn('Metadata found but appears empty');
                        processingMsg.textContent = '⚠️ AI found some data but it appears incomplete.';
                        processingMsg.style.color = '#ff9800';
                        showJSONParseFailedPopup('AI returned incomplete metadata. Please verify the information and fill in missing fields manually.');
                    }
                } else {
                    // All parsing methods failed
                    console.error('❌ Failed to extract valid metadata');
                    processingMsg.textContent = '❌ Could not parse AI response format.';
                    processingMsg.style.color = '#f44336';
                    showJSONParseFailedPopup('AI response could not be parsed. The AI might have returned an unexpected format.');
                    hideAIProcessingState(false);
                }
            } else {
                processingMsg.textContent = '❌ Could not identify book metadata from the provided information.';
                processingMsg.style.color = '#f44336';
                showJSONParseFailedPopup('No valid response received from AI service.');
                hideAIProcessingState(false);
            }
        })
        .catch(error => {
            console.error('Error analyzing text with Perplexity:', error);
            processingMsg.textContent = '❌ Error connecting to AI service for metadata generation.';
            processingMsg.style.color = '#f44336';
            showJSONParseFailedPopup(`Connection error: ${error.message}`);
            hideAIProcessingState(false);
        })
}*/

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;

            img.onload = function () {
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

            img.onerror = function (error) {
                reject(error);
            };
        };

        reader.onerror = function (error) {
            reject(error);
        };
    });
}


// Saving images/videos locally
async function processImagesLocally() {
    const fileInput = document.getElementById('image-upload');
    const files = Array.from(fileInput.files);
    const previewDiv = document.getElementById('image-preview');
    const progressDiv = document.getElementById('upload-progress');
    const persistentStatus = document.getElementById('save-status-persistent');

    // Clear previous previews
    previewDiv.innerHTML = '';
    persistentStatus.style.display = 'none';
    persistentStatus.className = '';

    if (files.length === 0) {
        progressDiv.innerHTML = 'Please select at least one image';
        return;
    }

    // Show previews (your existing preview code)
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

    // Now save files locally
    await saveFilesLocally(files, progressDiv);
}

async function saveFilesLocally(files, progressDiv) {
    const persistentStatus = document.getElementById('save-status-persistent');
    
    try {
        persistentStatus.style.display = 'none';
        persistentStatus.className = '';

        // Check browser support
        if (!window.showSaveFilePicker) {
            await fallbackDownload(files, progressDiv);
            return;
        }

        let savedCount = 0;
        let errorCount = 0;
        let lastDirectory = null;

        for (const file of files) {
            try {
                progressDiv.innerHTML = `Saving file ${savedCount + 1}/${files.length}: ${file.name}...`;

                // Use showSaveFilePicker for each file (like your MARC download)
                const options = {
                    suggestedName: file.name,
                    types: [{
                        description: 'Image/Video files',
                        accept: {
                            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                            'video/*': ['.mp4', '.webm', '.mov', '.avi']
                        }
                    }]
                };

                // If we saved a file before, try to start in the same directory
                if (lastDirectory) {
                    options.startIn = lastDirectory;
                }

                const fileHandle = await showSaveFilePicker(options);
                
                // Remember the directory for next file
                lastDirectory = fileHandle;

                const writable = await fileHandle.createWritable();
                await writable.write(file);
                await writable.close();

                savedCount++;

            } catch (fileError) {
                if (fileError.name === 'AbortError') {
                    // User cancelled, ask if they want to continue
                    if (files.length > 1 && savedCount < files.length - 1) {
                        const continueDownload = confirm(`Skipped ${file.name}. Continue with remaining files?`);
                        if (!continueDownload) {
                            break;
                        }
                    }
                } else {
                    console.error(`Error saving ${file.name}:`, fileError);
                    errorCount++;
                }
            }
        }

        // Show results
        progressDiv.innerHTML = '';
        
        if (savedCount > 0) {
            persistentStatus.className = errorCount === 0 ? 'success' : 'partial';
            persistentStatus.innerHTML = `✅ Saved ${savedCount} file(s)${errorCount > 0 ? `, ${errorCount} skipped` : ''}`;
            persistentStatus.style.display = 'block';
            showSuccessPopup(savedCount, 'selected location', errorCount);
        } else {
            progressDiv.innerHTML = '<span style="color: #666;">No files were saved</span>';
        }

    } catch (error) {
        console.error('Error in saveFilesLocally:', error);
        await fallbackDownload(files, progressDiv);
    }
}

// Fallback using traditional download (works on all browsers including Mac Safari)
async function fallbackDownload(files, progressDiv) {
    progressDiv.innerHTML = 'Using standard download method...';
    
    let downloadedCount = 0;
    
    for (const file of files) {
        try {
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            downloadedCount++;
            
            // Small delay between downloads to prevent browser blocking
            if (files.length > 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (err) {
            console.error(`Fallback download failed for ${file.name}:`, err);
        }
    }
    
    progressDiv.innerHTML = `<span style="color: #4CAF50;">✅ Downloaded ${downloadedCount} file(s) to your Downloads folder</span>`;
}

// Function to show success popup
function showSuccessPopup(savedCount, folderName, errorCount = 0) {
    // Create popup elements
    const backdrop = document.createElement('div');
    backdrop.className = 'success-popup-backdrop';

    const popup = document.createElement('div');
    popup.className = 'success-popup';

    let message = '';
    if (errorCount === 0) {
        message = `
            <h3>✅ Success!</h3>
            <p>Successfully saved <strong>${savedCount} file(s)</strong> to:</p>
            <p style="font-weight: bold; color: #4CAF50;">${folderName}</p>
            <div class="close-info">This popup will close automatically in 3 seconds</div>
        `;
    } else {
        message = `
            <h3>⚠️ Partially Complete</h3>
            <p>Saved <strong>${savedCount} file(s)</strong> successfully</p>
            <p style="color: #ff9800;"><strong>${errorCount} file(s)</strong> failed to save</p>
            <p>Folder: <strong>${folderName}</strong></p>
            <div class="close-info">This popup will close automatically in 4 seconds</div>
        `;
    }

    popup.innerHTML = message;

    // Show popup
    backdrop.style.display = 'block';
    popup.style.display = 'block';
    document.body.appendChild(backdrop);
    document.body.appendChild(popup);

    // Auto-close after 3-4 seconds
    const closeTime = errorCount === 0 ? 3000 : 4000;

    setTimeout(() => {
        // Add fade out animation
        popup.classList.add('fade-out');

        // Remove elements after animation completes
        setTimeout(() => {
            backdrop.remove();
            popup.remove();
        }, 300);
    }, closeTime);

    // Allow manual close by clicking backdrop
    backdrop.onclick = function () {
        popup.classList.add('fade-out');
        setTimeout(() => {
            backdrop.remove();
            popup.remove();
        }, 300);
    };

    console.log(`Success popup shown: ${savedCount} files saved to ${folderName}`);
}