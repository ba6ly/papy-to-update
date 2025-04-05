// File Storage System using IndexedDB
// This provides persistent storage within the browser

class FileStorageSystem {
    constructor(dbName = 'fileStorageDB', version = 1) {
      this.dbName = dbName;
      this.version = version;
      this.db = null;
      this.ready = this.initDB();
    }
  
    // Initialize the database
    async initDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.version);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Create object stores for different file types
          if (!db.objectStoreNames.contains('files')) {
            const fileStore = db.createObjectStore('files', { keyPath: 'id' });
            fileStore.createIndex('type', 'type', { unique: false });
            fileStore.createIndex('uploaded', 'uploaded', { unique: false });
          }
          
          // Create separate stores for each category for easier management
          const categories = ['question-papers', 'photo-gallery', 'newsletter', 'notes'];
          categories.forEach(category => {
            if (!db.objectStoreNames.contains(category)) {
              const store = db.createObjectStore(category, { keyPath: 'id' });
              store.createIndex('name', 'name', { unique: false });
              store.createIndex('uploaded', 'uploaded', { unique: false });
            }
          });
        };
        
        request.onsuccess = (event) => {
          this.db = event.target.result;
          console.log('Database initialized successfully');
          resolve(true);
        };
        
        request.onerror = (event) => {
          console.error('Database initialization error:', event.target.error);
          reject(event.target.error);
        };
      });
    }
  
    // Ensure DB is ready before any operation
    async ensureDBReady() {
      if (!this.db) {
        await this.ready;
      }
      return this.db;
    }
  
    // Store a file in the database
    async storeFile(file, metadata = {}) {
      await this.ensureDBReady();
      
      return new Promise((resolve, reject) => {
        // Convert the file to an ArrayBuffer for storage
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          const fileData = event.target.result;
          
          // Create a unique ID for the file
          const id = metadata.id || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Determine file category based on metadata or fallback to general 'files'
          const category = metadata.category || 'files';
          
          // Prepare the file object
          const fileObject = {
            id: id,
            name: file.name,
            type: file.type,
            size: file.size,
            data: fileData,
            uploaded: new Date(),
            lastAccessed: new Date(),
            ...metadata
          };
          
          // Store in both the general files store and the category-specific store
          try {
            // Store in general files collection
            const filesTx = this.db.transaction(['files'], 'readwrite');
            const filesStore = filesTx.objectStore('files');
            filesStore.put(fileObject);
            
            // Store in category-specific collection if it exists
            if (this.db.objectStoreNames.contains(category)) {
              const categoryTx = this.db.transaction([category], 'readwrite');
              const categoryStore = categoryTx.objectStore(category);
              categoryStore.put(fileObject);
            }
            
            resolve({
              id: id,
              name: file.name,
              type: file.type,
              size: file.size,
              category: category,
              url: URL.createObjectURL(file) // Create a temporary URL for immediate use
            });
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          reject(error);
        };
        
        reader.readAsArrayBuffer(file);
      });
    }
  
    // Retrieve a file by ID
    async getFile(id, category = 'files') {
      await this.ensureDBReady();
      
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction([category], 'readonly');
          const store = tx.objectStore(category);
          const request = store.get(id);
          
          request.onsuccess = (event) => {
            if (event.target.result) {
              const fileObject = event.target.result;
              
              // Update last accessed time
              this.updateLastAccessed(id, category);
              
              // Convert ArrayBuffer back to Blob
              const blob = new Blob([fileObject.data], { type: fileObject.type });
              
              // Create a URL for the blob (for display/download)
              fileObject.url = URL.createObjectURL(blob);
              
              resolve(fileObject);
            } else {
              reject(new Error('File not found'));
            }
          };
          
          request.onerror = (event) => {
            reject(event.target.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    }
  
    // Delete a file by ID
    async deleteFile(id, category = 'files') {
      await this.ensureDBReady();
      
      return new Promise((resolve, reject) => {
        try {
          // Delete from the general files store
          const filesTx = this.db.transaction(['files'], 'readwrite');
          const filesStore = filesTx.objectStore('files');
          filesStore.delete(id);
          
          // Delete from the category-specific store if it exists
          if (this.db.objectStoreNames.contains(category)) {
            const categoryTx = this.db.transaction([category], 'readwrite');
            const categoryStore = categoryTx.objectStore(category);
            categoryStore.delete(id);
          }
          
          resolve({ success: true, message: `File ${id} deleted successfully` });
        } catch (error) {
          reject(error);
        }
      });
    }
  
    // List all files or files of a specific category
    async listFiles(category = 'files') {
      await this.ensureDBReady();
      
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction([category], 'readonly');
          const store = tx.objectStore(category);
          const request = store.getAll();
          
          request.onsuccess = (event) => {
            const files = event.target.result.map(file => {
              // Don't include the full file data in the list to save memory
              const { data, ...fileInfo } = file;
              return fileInfo;
            });
            
            resolve(files);
          };
          
          request.onerror = (event) => {
            reject(event.target.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    }
  
    // Update the last accessed time
    async updateLastAccessed(id, category = 'files') {
      await this.ensureDBReady();
      
      return new Promise((resolve, reject) => {
        try {
          const tx = this.db.transaction([category], 'readwrite');
          const store = tx.objectStore(category);
          const request = store.get(id);
          
          request.onsuccess = (event) => {
            const fileObject = event.target.result;
            if (fileObject) {
              fileObject.lastAccessed = new Date();
              store.put(fileObject);
              resolve(true);
            } else {
              reject(new Error('File not found'));
            }
          };
          
          request.onerror = (event) => {
            reject(event.target.error);
          };
        } catch (error) {
          reject(error);
        }
      });
    }
  }
  
  // Singleton instance for app-wide use
  const fileStorage = new FileStorageSystem();