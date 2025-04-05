// Integration with your upload interface

document.addEventListener("DOMContentLoaded", function () {
    const dropArea = document.getElementById("drop-area");
    const fileInput = document.getElementById("file-input");
    const uploadsList = document.getElementById("uploads-list");
    let currentCategory = "files"; // Default category
    
    // Initialize our storage system
    const fileStorage = new FileStorageSystem();
    
    // Open file dialog on click
    if (dropArea) {
        dropArea.addEventListener("click", () => fileInput.click());
    }
    
    // Set the current category based on user selection
    window.showUpload = function(category) {
        const dialog = document.getElementById("upload-dialog");
        const titleElement = document.getElementById("upload-title");
        
        currentCategory = category || "files";
        
        if (titleElement) {
            // Capitalize first letter and add spaces between words
            const formattedTitle = currentCategory
                .replace(/-/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            titleElement.innerHTML = `<p class="bold">Upload ${formattedTitle}</p>`;
        }
        
        if (dialog) {
            dialog.style.display = "block";
        }
        
        // Load existing files for this category
        loadExistingFiles(currentCategory);
    };
    
    // Handle file selection from input
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            handleFiles(fileInput.files);
        });
    }
    
    // Handle drag and drop events
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropArea.classList.add('highlight');
        }
        
        function unhighlight() {
            dropArea.classList.remove('highlight');
        }
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }
    }
    
    // Process the files
    async function handleFiles(files) {
        [...files].forEach(async file => {
            try {
                // Store the file in our system
                const fileInfo = await fileStorage.storeFile(file, {
                    category: currentCategory
                });
                
                // Create UI element for the file
                createFileElement(fileInfo);
            } catch (error) {
                console.error("Error storing file:", error);
                alert("Failed to upload file: " + error.message);
            }
        });
    }
    
    // Create UI element for a file
    function createFileElement(fileInfo) {
        let fileItem = document.createElement("div");
        fileItem.classList.add("file-item");
        fileItem.dataset.fileId = fileInfo.id;
        
        let fileType = fileInfo.type.includes("image") ? "🖼️" : 
                       fileInfo.type.includes("pdf") ? "📄" : 
                       fileInfo.type.includes("doc") ? "📝" : "📁";
        
        fileItem.innerHTML = `
            <span class="file-type">${fileType}</span>
            <span class="file-name">${fileInfo.name}</span>
            <span class="file-size">${(fileInfo.size / 1024 / 1024).toFixed(2)} MB</span>
            <button class="preview-btn">👁️</button>
            <button class="delete-btn">🗑️</button>
            <div class="progress-bar"><div class="progress" style="width: 100%;"></div></div>
        `;
        
        if (uploadsList) {
            uploadsList.appendChild(fileItem);
        }
        
        // Preview file button
        const previewBtn = fileItem.querySelector(".preview-btn");
        if (previewBtn) {
            previewBtn.addEventListener("click", async () => {
                try {
                    const file = await fileStorage.getFile(fileInfo.id, currentCategory);
                    if (file.type.includes("image")) {
                        // For images, open in a lightbox or new tab
                        window.open(file.url, "_blank");
                    } else {
                        // For other files, download or open in appropriate viewer
                        const a = document.createElement("a");
                        a.href = file.url;
                        a.download = file.name;
                        a.click();
                    }
                } catch (error) {
                    console.error("Error retrieving file:", error);
                    alert("Failed to preview file: " + error.message);
                }
            });
        }
        
        // Delete file button
        const deleteBtn = fileItem.querySelector(".delete-btn");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
                try {
                    await fileStorage.deleteFile(fileInfo.id, currentCategory);
                    fileItem.remove();
                } catch (error) {
                    console.error("Error deleting file:", error);
                    alert("Failed to delete file: " + error.message);
                }
            });
        }
    }
    
    // Load existing files for a category
    async function loadExistingFiles(category) {
        if (!uploadsList) return;
        
        // Clear the current list
        uploadsList.innerHTML = '';
        
        try {
            // Get all files for the selected category
            const files = await fileStorage.listFiles(category);
            
            // Create UI elements for each file
            files.forEach(file => {
                createFileElement(file);
            });
        } catch (error) {
            console.error("Error loading files:", error);
        }
    }
    
    // Close upload dialog
    window.closeDialog = function() {
        const dialog = document.getElementById("upload-dialog");
        if (dialog) {
            dialog.style.display = "none";
        }
    };
});