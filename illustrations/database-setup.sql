-- Create the database
CREATE DATABASE IF NOT EXISTS user_authentication;
USE user_authentication;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Optionally, create a test user (password is 'password123')
-- Note: The password is hashed using PHP's password_hash function
-- This is just an example; in production, you should create users through a registration form
INSERT INTO users (username, password, email) VALUES 
('test_user', '$2y$10$RbUv3VYVGXvw7Ee9Zy0UpOn7Kty3XlKk3rAw9s46jd0qC0/bJNzLm', 'test@example.com');
