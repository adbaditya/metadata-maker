// AI Processing State Management
let aiProcessingInProgress = false;
let originalButtonStates = {};

function showAIProcessingState() {
    if (aiProcessingInProgress) return;
    aiProcessingInProgress = true;

    // Show notification
    const notification = document.createElement('div');
    notification.id = 'ai-processing-notification';
    notification.className = 'ai-processing-notification';
    notification.innerHTML = `
        <div class="ai-processing-spinner"></div>
        <span>AI is analyzing material images...</span>
    `;
    document.body.appendChild(notification);
    console.log('AI processing state activated');
}

function hideAIProcessingState(success = true) {
    aiProcessingInProgress = false;

    // Hide notification
    const notification = document.getElementById('ai-processing-notification');
    if (notification) {
        notification.remove();
    }

    if (success) {
        showSuccessNotification('Material analysis completed successfully!');
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

// Material Image Processing Functions
function materialSampleImageSearch() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;

    fileInput.onchange = async function (e) {
        const files = Array.from(e.target.files);
        if (!files || files.length === 0) return;

        console.log(`Selected ${files.length} material image(s)`);

        // Store images for AI processing
        window.materialImages = files;

        // Show preview and AI button
        displayMaterialImagePreview(files);
    };

    fileInput.click();
}

function displayMaterialImagePreview(files) {
    const progressDiv = document.getElementById('material-progress') || createMaterialProgressDiv();

    // Clear previous content
    progressDiv.innerHTML = '';

    // Show image previews
    const previewContainer = document.createElement('div');
    previewContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0;';

    files.forEach((file, index) => {
        const preview = document.createElement('div');
        preview.style.cssText = 'text-align: center;';

        const img = document.createElement('img');
        img.style.cssText = 'max-width: 150px; max-height: 150px; border: 1px solid #ddd; border-radius: 5px;';
        img.src = URL.createObjectURL(file);

        const label = document.createElement('div');
        label.textContent = file.name;
        label.style.cssText = 'font-size: 12px; color: #666; margin-top: 5px; word-break: break-word; max-width: 150px;';

        preview.appendChild(img);
        preview.appendChild(label);
        previewContainer.appendChild(preview);
    });

    progressDiv.appendChild(previewContainer);

    // Add AI analysis button
    const instructionDiv = document.createElement('div');
    instructionDiv.innerHTML = `
        <div style="margin-top: 15px; padding: 10px; background-color: #f0f8ff; border: 1px solid #b0d4f1; border-radius: 5px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Images uploaded successfully!</p>
            <p style="margin: 0 0 15px 0;">AI will analyze the images to generate material sample information.</p>
            <button id="material-ai-btn" style="background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold;">
                Generate Materials Data with AI
            </button>
        </div>
    `;

    progressDiv.appendChild(instructionDiv);

    // Add click handler
    document.getElementById('material-ai-btn').onclick = function () {
        if (aiProcessingInProgress) {
            console.log('AI processing already in progress');
            return;
        }
        generateMaterialMetadataWithAI();
    };
}

function createMaterialProgressDiv() {
    let progressDiv = document.getElementById('material-progress');
    if (!progressDiv) {
        progressDiv = document.createElement('div');
        progressDiv.id = 'material-progress';
        progressDiv.style.cssText = 'margin-top: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;';

        // Insert after the image upload section or at end of body
        const imageSection = document.querySelector('[name="images"], .image-upload-section, #image-upload');
        if (imageSection) {
            imageSection.parentNode.insertBefore(progressDiv, imageSection.nextSibling);
        } else {
            document.body.appendChild(progressDiv);
        }
    }
    return progressDiv;
}

// AI Processing Function
async function generateMaterialMetadataWithAI() {
    console.log('generateMaterialMetadataWithAI() called');

    if (aiProcessingInProgress) {
        console.log('AI processing already in progress');
        return;
    }

    if (!window.materialImages || window.materialImages.length === 0) {
        alert('No images available. Please upload images first.');
        return;
    }

    console.log('Starting AI processing for material sample');
    showAIProcessingState();

    try {
        // Get form inputs
        const itemName = document.querySelector('#title')?.value?.trim() || '';
        const manufacturer = document.querySelector('input[name="manufacturer"], #manufacturer')?.value?.trim() || '';
        const serialNumber = document.querySelector('input[name="serial_number"], #serial_no')?.value?.trim() || '';

        console.log('Material inputs:', { itemName, manufacturer, serialNumber });

        // Convert images to base64
        console.log('Converting images to base64...');
        const base64Images = await convertImagesToBase64(window.materialImages);
        console.log(`Converted ${base64Images.length} images`);

        // Build AI query
        let textQuery = `Analyze these material sample images and provide detailed information.

Item Information:
${itemName ? `Item Name: ${itemName}` : ''}
${manufacturer ? `Manufacturer: ${manufacturer}` : ''}
${serialNumber ? `Serial Number: ${serialNumber}` : ''}

Please analyze the uploaded images and the item name as it is search for information about this material/item. Look for:
- Material composition and properties, item name.
- Description of the material from the source.
- Title and alternative title.
- Material Category
- Manufacturer details and product information

Return the information in this exact JSON format:
{
    "Name_of_Item": "[Official material name from manufacturer or catalog]",
    "Alternative_Title": "[Trade/common names, abbreviations if any]", 
    "Name_of_Manufacturer": "[Exact manufacturer/designer as officially listed]",
    "Country_State_Province_of_Manufacturer": "[Geographic origin of manufacturer]",
    "Material_Category": "[]",
    "Description_of_Item": "[Description of the material from the source in detail talking about the item and it's nature that helps in cataloguing.]",
    "References": "[Direct URLs for catalog entries or official sources]"
}

CRITICAL: Return ONLY the JSON object. No explanations or additional text.`;

        console.log('Calling AI with material analysis query...');

        const perplexityData = await fetchFromPerplexityWithImages(textQuery, base64Images);

        if (perplexityData && !perplexityData.error && perplexityData.choices?.[0]?.message?.content) {
            const content = perplexityData.choices[0].message.content;
            console.log('Raw response received');

            const materialData = tryParseWithFallbacks(content);

            if (materialData && !materialData.error) {
                console.log('Success! Displaying material data...');
                displayMaterialResults(materialData);
                hideAIProcessingState(true);
            } else {
                throw new Error('Could not extract valid material data from response');
            }
        } else {
            throw new Error(perplexityData?.error?.message || 'No valid response from AI');
        }

    } catch (error) {
        console.error('Error:', error);
        showMaterialErrorPopup(`Error: ${error.message}`);
        hideAIProcessingState(false);
    }
}

// Results Display Functions
function displayMaterialResults(materialData) {
    const progressDiv = document.getElementById('material-progress');

    // Remove existing results
    const existingResults = document.getElementById('material-results');
    if (existingResults) {
        existingResults.remove();
    }

    // Create results display box
    const resultsBox = document.createElement('div');
    resultsBox.id = 'material-results';
    resultsBox.style.cssText = `
        margin-top: 20px;
        padding: 20px;
        border: 2px solid #4CAF50;
        border-radius: 8px;
        background-color: #f8fff8;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;

    let resultsHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3 style="margin: 0; color: #2e7d32;">AI Material Analysis Results</h3>
            <button onclick="copyMaterialResults()" style="background: #2196F3; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">Copy Results</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
    `;

    // Fields to display
    const fieldsToDisplay = [
        { key: 'Name_of_Item', label: 'Name of Item', important: true },
        { key: 'Alternative_Title', label: 'Alternative Title' },
        { key: 'Name_of_Manufacturer', label: 'Manufacturer', important: true },
        { key: 'Country_State_Province_of_Manufacturer', label: 'Country/State/Province' },
        { key: 'Material_Category', label: 'Material Category', important: true },
        { key: 'Description_of_Item', label: 'Description', fullWidth: true },
        { key: 'References', label: 'References', fullWidth: true }
    ];

    fieldsToDisplay.forEach(field => {
        const value = materialData[field.key];
        if (value && value !== 'null' && value !== null) {
            const gridClass = field.fullWidth ? 'grid-column: 1 / -1;' : '';
            const importantStyle = field.important ? 'background-color: #fff3e0; border-left: 4px solid #ff9800;' : '';

            resultsHTML += `
                <div style="margin-bottom: 12px; ${gridClass} ${importantStyle} padding: 10px; border-radius: 4px;">
                    <strong style="color: #333; display: block; margin-bottom: 5px;">${field.label}:</strong>
                    <span style="color: #555; line-height: 1.4;">${value}</span>
                </div>
            `;
        }
    });

    resultsHTML += `
        </div>
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            Analysis completed at: ${new Date().toLocaleString()}
        </div>
        <div style="margin-top: 10px;">
            <button onclick="hideMaterialResults()" style="background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Hide Results</button>
        </div>
    `;

    resultsBox.innerHTML = resultsHTML;

    // Store data for copy function
    window.currentMaterialData = materialData;

    progressDiv.appendChild(resultsBox);
}

function copyMaterialResults() {
    if (window.currentMaterialData) {
        const textToCopy = JSON.stringify(window.currentMaterialData, null, 2);
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Material analysis results copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
}

function hideMaterialResults() {
    const resultsBox = document.getElementById('material-results');
    if (resultsBox) {
        resultsBox.remove();
    }
}

function showMaterialErrorPopup(message) {
    alert(message);
}

// Utility Functions
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

function tryParseWithFallbacks(content) {
    try {
        return JSON.parse(content);
    } catch (error) {
        console.log('Direct parsing failed, trying to extract JSON...');

        // Try to extract JSON from response
        const startBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');

        if (startBrace !== -1 && lastBrace !== -1 && lastBrace > startBrace) {
            const jsonStr = content.substring(startBrace, lastBrace + 1);
            try {
                return JSON.parse(jsonStr);
            } catch (error2) {
                console.log('Extracted JSON parsing failed:', error2);
            }
        }

        console.error('All JSON parsing methods failed');
        return null;
    }
}

// Initialize when button is clicked
document.addEventListener('DOMContentLoaded', function () {
    const uploadBtn = document.querySelector('#upload-images-btn, .upload-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', materialSampleImageSearch);
    }
});


async function fetchFromPerplexityWithImages(textQuery, base64Images = []) {
    try {
        console.log('Sending request to worker:', {
            hasText: !!textQuery,
            imageCount: base64Images.length
        });

        const requestBody = {
            query: textQuery
        };

        // Add images if provided
        if (base64Images && base64Images.length > 0) {
            requestBody.images = base64Images;
            console.log('Including images in request');
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
            console.error('Perplexity API Error:', data.error);
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
                    console.log('Successfully parsed response:', parsedData);
                    return {
                        choices: [{ message: { content: JSON.stringify(parsedData) } }],
                        citations: data.result.citations,
                        isMultiModal: base64Images.length > 0
                    };
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    return { error: 'parse_error', message: 'Could not parse response' };
                }
            }
        }

        return { error: 'no_content', message: 'No valid content in response' };

    } catch (error) {
        console.error('Network error:', error);
        return { error: 'network_error', message: error.message };
    }
}