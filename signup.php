<?php
// Set proper headers first
header('Content-Type: application/json');

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Log errors to a file
error_log("Processing signup request");


// Including the database connection
require_once 'db_connect.php';

// Checking if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Getting form data
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $dob = $_POST['dob'];
    
    // Validating input
    if (empty($name) || empty($email) || empty($password) || empty($dob)) {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }
    
    // Validating email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["status" => "error", "message" => "Invalid email format"]);
        exit;
    }
    
    // Checking if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "error", "message" => "Email already exists"]);
        exit;
    }
    
    // Hashing password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Inserting new user
    try {
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, dob) VALUES (?, ?, ?, ?)");
        $stmt->execute([$name, $email, $hashed_password, $dob]);
        
        echo json_encode(["status" => "success", "message" => "User registered successfully"]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Registration failed: " . $e->getMessage()]);
    }
} else {

    // if not a POST request
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}
?>