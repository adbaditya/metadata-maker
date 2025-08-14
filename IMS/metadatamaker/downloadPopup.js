let downloadInProgress = false;

async function showDownloadLocationPicker(content, extension) {
    downloadInProgress = true;

    // Create popup modal
    const modal = document.createElement('div');
    modal.id = 'downloadModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 8px;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filenameField = document.querySelector('#filename');
    let filename;

    if (filenameField && filenameField.value.trim()) {
        const userFilename = filenameField.value.trim();
        if (!userFilename.endsWith(`.${extension}`)) {
            filename = `${userFilename}.${extension}`;
        } else {
            filename = userFilename;
        }
    } else {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        filename = `metadata_${timestamp}.${extension}`;
    }

    // Show which format is being downloaded
    const formatName = extension.toUpperCase();

    modalContent.innerHTML = `
        <h3>Download ${formatName} File</h3>
        <p>Choose how to download your file:</p>
        <p><strong>${filename}</strong></p>
        <div style="margin: 20px 0;">
            <button id="chooseLocation" style="padding: 10px 20px; margin: 5px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
                📁 Choose Download Location
            </button>
            <br>
            <button id="defaultDownload" style="padding: 10px 20px; margin: 5px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                ⬇️ Download to Default Folder
            </button>
        </div>
        <button id="cancelDownload" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Cancel
        </button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    return new Promise((resolve) => {
        // Choose location button
        document.getElementById('chooseLocation').onclick = async () => {
            document.body.removeChild(modal);
            try {
                if ('showSaveFilePicker' in window) {
                    await downloadFileWithDirectoryPicker(content, filename, extension);
                } else {
                    alert('Directory picker not supported in this browser. Using default download.');
                    fallbackDownload(content, filename, extension);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    fallbackDownload(content, filename, extension);
                }
            }
            downloadInProgress = false;
            resolve();
        };

        // Default download button
        document.getElementById('defaultDownload').onclick = () => {
            document.body.removeChild(modal);
            fallbackDownload(content, filename, extension);
            downloadInProgress = false;
            resolve();
        };

        // Cancel button
        document.getElementById('cancelDownload').onclick = () => {
            document.body.removeChild(modal);
            downloadInProgress = false;
            resolve();
        };

        // Close on background click
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                downloadInProgress = false;
                resolve();
            }
        };
    });
}

async function downloadFileWithDirectoryPicker(content, filename, extension) {
    let mimeType;
    switch (extension) {
        case 'mrc':
            mimeType = 'application/marc';
            break;
        case 'xml':
            mimeType = 'application/xml';
            break;
        case 'html':
            mimeType = 'text/html';
            break;
        default:
            mimeType = 'text/plain';
    }

    const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
            description: 'Metadata files',
            accept: { [mimeType]: [`.${extension}`] }
        }]
    });

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    // Show success message
    showSuccessMessage(`${filename} saved successfully!`);
}

function fallbackDownload(content, filename, extension) {
    let mimeType;
    switch (extension) {
        case 'mrc':
            mimeType = 'application/marc';
            break;
        case 'xml':
            mimeType = 'application/xml';
            break;
        case 'html':
            mimeType = 'text/html';
            break;
        default:
            mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`Downloaded: ${filename}`);
}

function showSuccessMessage(message) {
    const successModal = document.createElement('div');
    successModal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 15px 25px;
        border-radius: 4px;
        z-index: 1001;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    successModal.innerHTML = `✅ ${message}`;
    document.body.appendChild(successModal);

    setTimeout(() => {
        if (document.body.contains(successModal)) {
            document.body.removeChild(successModal);
        }
    }, 3000);
}