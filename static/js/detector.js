document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('upload-form');
    if (!uploadForm) return;

    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectImageBtn = document.getElementById('select-image-btn');
    const processImageBtn = document.getElementById('process-image-btn');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const filenameDisplay = document.getElementById('filename-display');

    // File input event
    selectImageBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            fileInput.files = e.dataTransfer.files;
            handleFile(file);
        }
    });

    // Click area to select file
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== selectImageBtn) {
            fileInput.click();
        }
    });

    // Form submission with loading state
    uploadForm.addEventListener('submit', (e) => {
        const btnText = processImageBtn.querySelector('.btn-text');
        const spinner = processImageBtn.querySelector('.loading-spinner');
        
        if (btnText && spinner) {
            btnText.style.display = 'none';
            spinner.style.display = 'block';
            processImageBtn.disabled = true;
            processImageBtn.classList.remove('pulse');
        }
    });

    function handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, JPEG, PNG).');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB.');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
            filenameDisplay.textContent = file.name;
            uploadArea.style.display = 'none';
            
            // Enable process button
            processImageBtn.disabled = false;
            processImageBtn.classList.add('pulse');
        };
        reader.readAsDataURL(file);
    }
});

// Remove image function
function removeImage() {
    const uploadArea = document.getElementById('upload-area');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const fileInput = document.getElementById('file-input');
    const processImageBtn = document.getElementById('process-image-btn');
    
    // Reset form
    fileInput.value = '';
    imagePreviewContainer.style.display = 'none';
    uploadArea.style.display = 'block';
    processImageBtn.disabled = true;
    processImageBtn.classList.remove('pulse');
}