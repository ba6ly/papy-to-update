<?php
// Starting the session
session_start();

// Including database connection
require_once 'db_connect.php';

// Checking if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Getting form data
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Validating input
    if (empty($email) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "Email and password are required"]);
        exit;
    }
    
    // Checking if user exists
    try {
        $stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() == 1) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verifying password
            if (password_verify($password, $user['password'])) {

                // Password is correct, starting a new session
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                
                echo json_encode(["status" => "success", "message" => "Login successful"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid password"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "User not found"]);
        }
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Login failed: " . $e->getMessage()]);
    }
} else {
    // if not a POST request

    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
?>