<?php
// Check if form is submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Database configuration
    $db_host = 'localhost';
    $db_user = 'your_db_username';
    $db_pass = 'your_db_password';
    $db_name = 'user_authentication';
    
    // Create database connection
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    // Check connection
    if ($conn->connect_error) {
        $error_message = "Database connection failed: " . $conn->connect_error;
    } else {
        // Get form data
        $username = $_POST['username'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $confirm_password = $_POST['confirm_password'] ?? '';
        
        // Validate inputs
        if (empty($username) || empty($email) || empty($password) || empty($confirm_password)) {
            $error_message = "All fields are required";
        } elseif ($password !== $confirm_password) {
            $error_message = "Passwords do not match";
        } elseif (strlen($password) < 8) {
            $error_message = "Password must be at least 8 characters long";
        } else {
            // Check if username already exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $stmt->store_result();
            
            if ($stmt->num_rows > 0) {
                $error_message = "Username already exists";
            } else {
                // Check if email already exists
                $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $stmt->store_result();
                
                if ($stmt->num_rows > 0) {
                    $error_message = "Email already exists";
                } else {
                    // Hash password
                    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
                    
                    // Insert new user
                    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
                    $stmt->bind_param("sss", $username, $email, $hashed_password);
                    
                    if ($stmt->execute()) {
                        $success_message = "Registration successful. You can now <a href='index.html'>login</a>.";
                    } else {
                        $error_message = "Error: " . $stmt->error;
                    }
                }
            }
            
            $stmt->close();
        }
        
        $conn->close();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <style>
        :root {
            --dark-purple: #190933;
            --coral: #EE9E8E;
            --peach: #FFDBC3;
            --cream: #FFF5E0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: var(--dark-purple);
            overflow: hidden;
        }
        
        .register-container {
            width: 400px;
            background-color: var(--cream);
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            padding: 40px;
            position: relative;
            overflow: hidden;
        }
        
        .register-container::before {
            content: '';
            position: absolute;
            top: -50px;
            left: -50px;
            width: 150px;
            height: 150px;
            background-color: var(--coral);
            border-radius: 50%;
            opacity: 0.5;
            z-index: 0;
        }
        
        .register-container::after {
            content: '';
            position: absolute;
            bottom: -50px;
            right: -50px;
            width: 120px;
            height: 120px;
            background-color: var(--peach);
            border-radius: 50%;
            opacity: 0.6;
            z-index: 0;
        }
        
        h2 {
            color: var(--dark-purple);
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
            font-weight: 600;
        }
        
        .input-group {
            position: relative;
            margin-bottom: 25px;
            z-index: 1;
        }
        
        .input-group input {
            width: 100%;
            padding: 12px 15px;
            border: none;
            border-radius: 12px;
            background-color: white;
            font-size: 16px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        .input-group input:focus {
            outline: none;
            box-shadow: 0 3px 8px rgba(238, 158, 142, 0.4);
        }
        
        .input-group label {
            position: absolute;
            left: 15px;
            top: 12px;
            color: #666;
            font-size: 16px;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .input-group input:focus ~ label,
        .input-group input:valid ~ label {
            top: -10px;
            left: 10px;
            font-size: 12px;
            background-color: white;
            padding: 0 5px;
            color: var(--coral);
        }
        
        button {
            width: 100%;
            padding: 14px 20px;
            background-color: var(--dark-purple);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            position: relative;
            z-index: 1;
            transition: all 0.3s ease;
        }
        
        button:hover {
            background-color: #2a0e4f;
            transform: translateY(-2px);
            box-shadow: 0 8px 15px rgba(25, 9, 51, 0.2);
        }

        .login-link {
            text-align: center;
            margin-top: 20px;
            position: relative;
            z-index: 1;
        }
        
        .login-link a {
            color: var(--coral);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .login-link a:hover {
            color: var(--dark-purple);
            text-decoration: underline;
        }
        
        .message {
            margin-top: 15px;
            text-align: center;
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            position: relative;
            z-index: 1;
        }
        
        .message.error {
            background-color: rgba(255, 0, 0, 0.1);
            color: #d32f2f;
        }
        
        .message.success {
            background-color: rgba(76, 175, 80, 0.1);
            color: #388e3c;
        }
    </style>
</head>
<body>
    <div class="register-container">
        <h2>Create Account</h2>
        <?php if (isset($error_message)): ?>
            <div class="message error"><?php echo $error_message; ?></div>
        <?php endif; ?>
        
        <?php if (isset($success_message)): ?>
            <div class="message success"><?php echo $success_message; ?></div>
        <?php else: ?>
            <form method="POST" action="register.php">
                <div class="input-group">
                    <input type="text" id="username" name="username" required>
                    <label for="username">Username</label>
                </div>
                <div class="input-group">
                    <input type="email" id="email" name="email" required>
                    <label for="email">Email</label>
                </div>
                <div class="input-group">
                    <input type="password" id="password" name="password" required>
                    <label for="password">Password</label>
                </div>
                <div class="input-group">
                    <input type="password" id="confirm_password" name="confirm_password" required>
                    <label for="confirm_password">Confirm Password</label>
                </div>
                <button type="submit">Sign Up</button>
            </form>
        <?php endif; ?>
        <div class="login-link">
            Already have an account? <a href="index.html">Sign In</a>
        </div>
    </div>
</body>
</html>
