<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'your_db_username';
$db_pass = 'your_db_password';
$db_name = 'user_authentication';

// Create database connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    $response = array(
        'success' => false,
        'message' => 'Database connection failed'
    );
    echo json_encode($response);
    exit();
}

// Process login request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // Validate inputs
    if (empty($username) || empty($password)) {
        $response = array(
            'success' => false,
            'message' => 'Please provide both username and password'
        );
        echo json_encode($response);
        exit();
    }
    
    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Verify password (using password_hash and password_verify)
        if (password_verify($password, $user['password'])) {
            // Start session and set session variables
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            // Send success response
            $response = array(
                'success' => true,
                'message' => 'Login successful'
            );
        } else {
            // Password doesn't match
            $response = array(
                'success' => false,
                'message' => 'Invalid username or password'
            );
        }
    } else {
        // Username not found
        $response = array(
            'success' => false,
            'message' => 'Invalid username or password'
        );
    }
    
    // Close statement
    $stmt->close();
} else {
    // Not a POST request
    $response = array(
        'success' => false,
        'message' => 'Invalid request method'
    );
}

// Close connection
$conn->close();

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>
