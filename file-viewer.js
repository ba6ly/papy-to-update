// File Viewer Integration for each content type
class FileViewerManager {
    constructor() {
      this.storage = new FileStorageSystem();
      this.initViewers();
    }
    
    async initViewers() {
      // Initialize each viewer type based on page detection
      
      // Photo Gallery Viewer
      if (document.getElementById('photoGallery')) {
        this.initPhotoGallery();
      }
      
      // Newsletter Viewer
      if (document.getElementById('newsletter-display')) {
        this.initNewsletterViewer();
      }
      
      // Question Papers Viewer
      // This would be implemented similarly to the others
      
      // Notes Viewer
      // This would be implemented similarly to the others
    }
    
    // Initialize Photo Gallery Viewer
    async initPhotoGallery() {
      try {
        const photoGallery = document.getElementById('photoGallery');
        const photos = await this.storage.listFiles('photo-gallery');
        
        // Clear existing placeholders
        photoGallery.innerHTML = '';
        
        if (photos.length === 0) {
          // No photos yet, show upload prompt
          const emptyState = document.createElement('div');
          emptyState.classList.add('empty-state');
          emptyState.innerHTML = `
            <div class="placeholder">
              <h3>No photos uploaded yet</h3>
              <p>Click "Add Photo" to upload images to your gallery</p>
            </div>
          `;
          photoGallery.appendChild(emptyState);
        } else {
          // Display all photos in the gallery
          photos.forEach(async (photoInfo) => {
            try {
              // Get the full file with data
              const photo = await this.storage.getFile(photoInfo.id, 'photo-gallery');
              
              const galleryItem = document.createElement('div');
              galleryItem.classList.add('gallery-item');
              galleryItem.dataset.id = photo.id;
              
              // Create image element
              galleryItem.innerHTML = `
                <img src="${photo.url}" alt="${photo.name}" class="gallery-img" title="${photo.name}">
              `;
              
              photoGallery.appendChild(galleryItem);
              
              // Optional: Add click handler for lightbox view
              galleryItem.addEventListener('click', () => {
                this.openLightbox(photo);
              });
            } catch (err) {
              console.error("Failed to load photo:", err);
            }
          });
        }
        
        // Connect the upload button
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
          uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.location.href = 'Uploads.html?type=photo-gallery';
          });
        }
      } catch (error) {
        console.error("Error initializing photo gallery:", error);
      }
    }
    
    // Create a simple lightbox for image viewing
    openLightbox(photo) {
      const lightbox = document.createElement('div');
      lightbox.classList.add('lightbox');
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <span class="close-lightbox">&times;</span>
          <img src="${photo.url}" alt="${photo.name}">
          <div class="caption">${photo.name}</div>
        </div>
      `;
      
      document.body.appendChild(lightbox);
      
      // Add styles for the lightbox
      const style = document.createElement('style');
      style.innerHTML = `
        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .lightbox-content {
          max-width: 90%;
          max-height: 90%;
          position: relative;
        }
        .lightbox-content img {
          max-width: 100%;
          max-height: 80vh;
          border: 2px solid white;
        }
        .close-lightbox {
          position: absolute;
          top: -30px;
          right: 0;
          color: white;
          font-size: 30px;
          cursor: pointer;
        }
        .caption {
          color: white;
          text-align: center;
          padding: 10px;
        }
      `;
      document.head.appendChild(style);
      
      // Close lightbox when clicked
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('close-lightbox')) {
          lightbox.remove();
          style.remove();
        }
      });
    }
    
    // Initialize Newsletter Viewer
    async initNewsletterViewer() {
      try {
        const newsletterDisplay = document.getElementById('newsletter-display');
        
        // Check if we should load a specific newsletter
        const urlParams = new URLSearchParams(window.location.search);
        const newsletterId = urlParams.get('id');
        
        if (newsletterId) {
          // Load specific newsletter
          try {
            const newsletter = await this.storage.getFile(newsletterId, 'newsletter');
            
            // For PDF newsletters
            if (newsletter.type === 'application/pdf') {
              newsletterDisplay.innerHTML = `
                <iframe src="${newsletter.url}" width="100%" height="600" style="border: none;"></iframe>
              `;
            } 
            // For HTML newsletters
            else if (newsletter.type === 'text/html') {
              // Create an iframe to isolate the newsletter HTML
              newsletterDisplay.innerHTML = `
                <iframe id="newsletter-frame" style="width:100%; height:600px; border:none;"></iframe>
              `;
              
              const iframe = document.getElementById('newsletter-frame');
              iframe.onload = function() {
                const blob = new Blob([new Uint8Array(newsletter.data)], {type: 'text/html'});
                iframe.src = URL.createObjectURL(blob);
              };
              iframe.onload();
            }
            // For text newsletters
            else if (newsletter.type === 'text/plain') {
              const text = new TextDecoder().decode(newsletter.data);
              newsletterDisplay.innerHTML = `<pre>${text}</pre>`;
            }
            else {
              newsletterDisplay.innerHTML = `
                <p>This newsletter format (${newsletter.type}) cannot be displayed directly.</p>
                <p><a href="${newsletter.url}" download="${newsletter.name}">Download the newsletter</a></p>
              `;
            }
          } catch (err) {
            newsletterDisplay.innerHTML = `<p>Newsletter not found or could not be loaded.</p>`;
            console.error("Failed to load newsletter:", err);
          }
        } else {
          // Show the latest newsletter or a list of newsletters
          try {
            const newsletters = await this.storage.listFiles('newsletter');
            
            if (newsletters.length === 0) {
              newsletterDisplay.innerHTML = `<p>No newsletters have been uploaded yet.</p>`;
            } else {
              // Sort by date, newest first
              newsletters.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
              
              // Display the latest
              const latest = newsletters[0];
              newsletterDisplay.innerHTML = `
                <h3>${latest.name}</h3>
                <p>Uploaded on: ${new Date(latest.uploaded).toLocaleDateString()}</p>
                <p><a href="Viewing.html?id=${latest.id}">View this newsletter</a></p>
                <hr>
                <h4>All Newsletters</h4>
                <ul class="newsletter-list">
                  ${newsletters.map(nl => 
                    `<li>
                      <a href="Viewing.html?id=${nl.id}">${nl.name}</a> 
                      (${new Date(nl.uploaded).toLocaleDateString()})
                    </li>`
                  ).join('')}
                </ul>
              `;
            }
          } catch (err) {
            console.error("Failed to load newsletters:", err);
            newsletterDisplay.innerHTML = `<p>Could not load newsletters.</p>`;
          }
        }
      } catch (error) {
        console.error("Error initializing newsletter viewer:", error);
      }
    }
    
    // Other viewer methods would be implemented similarly
  }
  
  // Initialize the viewer manager when the DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const viewerManager = new FileViewerManager();
  });