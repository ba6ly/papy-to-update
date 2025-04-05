
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const statusMessage = document.getElementById('statusMessage');
    
    // Prepare data to send
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    // Send login request to PHP backend
    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            statusMessage.textContent = 'Login successful! Redirecting...';
            statusMessage.className = 'status-message success';
            
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = 'dashboard.php';
            }, 1500);
        } else {
            statusMessage.textContent = data.message || 'Invalid username or password';
            statusMessage.className = 'status-message error';
        }
    })
    .catch(error => {
        statusMessage.textContent = 'An error occurred. Please try again.';
        statusMessage.className = 'status-message error';
        console.error('Error:', error);
    });
});
