document.addEventListener('DOMContentLoaded', () => {
    const openUploadButton = document.getElementById('open-upload-button');
    const fileInput = document.getElementById('file-upload');

    // Open file dialog on button click
    openUploadButton.addEventListener('click', () => {
        fileInput.click();
    });
});

// State to store the file being processed
let currentFile = null;

// Handle File Drop
function handleFileDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
        currentFile = files[0];
        updateFileZone(currentFile);
    }
}

// Handle File Change
function handleFileChange(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        currentFile = files[0];
        updateFileZone(currentFile);
    }
}

// Update File Zone with Selected File
function updateFileZone(file) {
    const uploadZone = document.getElementById('upload-zone');
    uploadZone.innerHTML = `
        <strong>Selected File:</strong> ${file.name}
        <p class="text-muted">Size: ${(file.size / 1024).toFixed(2)} KB</p>
    `;
}

// Upload File to API
async function uploadFile() {
    if (!currentFile) {
        alert('No file selected for upload.');
        return;
    }

    const formData = new FormData();
    formData.append('file', currentFile);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/update-used-seconds/', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('File upload failed!');
        }

        const result = await response.json();
        displayAnalysisResult(result);
        resetFileZone();
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload the file. Please try again.');
    }
}

// Reset File Zone
function resetFileZone() {
    currentFile = null; // Clear current file state
    const uploadZone = document.getElementById('upload-zone');
    uploadZone.innerHTML = 'Drag & Drop Audio Here';
}

// Display Analysis Result
function displayAnalysisResult(data) {
    const analysisList = document.getElementById('analysis-list');

    // Remove placeholder if present
    if (analysisList.children[0].classList.contains('text-muted')) {
        analysisList.innerHTML = '';
    }

    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

    listItem.innerHTML = `
        <div class="d-flex align-items-center">
            <strong>${data.file_name}</strong>
            <span class="badge ${data.result === 'Real' ? 'badge-success' : 'badge-danger'} ml-3">
                ${data.result}
            </span>
        </div>
        <div>
            <span class="text-muted">Confidence: ${data.confidence}%</span>
        </div>
    `;

    analysisList.appendChild(listItem);
}
