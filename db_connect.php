<?php

$host = "localhost"; 
$dbname = "user_authentication"; 
$username = "root"; 
$password = ""; 

// Create PDO instance
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Set character set to UTF-8
    $conn->exec("SET NAMES utf8");
    
} catch(PDOException $e) {
    // Log error to a file (not shown to users)
    error_log("Connection failed: " . $e->getMessage());
    
    // Return a generic error message for security reasons
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit;
}
?>