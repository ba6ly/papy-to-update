<?php
// Start session
session_start();

// Check if user is logged in
function is_logged_in() {
    return isset($_SESSION['user_id']);
}

// Redirect if not logged in
function redirect_if_not_logged_in($redirect_to = 'login.html') {
    if (!is_logged_in()) {
        header("Location: $redirect_to");
        exit();
    }
}

// Get current user data
function get_user_data() {
    if (is_logged_in()) {
        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email']
        ];
    }
    return null;
}
?>