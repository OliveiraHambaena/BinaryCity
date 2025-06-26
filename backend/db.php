<?php
// Database credentials
$host = '127.0.0.1'; // or 'localhost'
$dbname = 'client_contact_db';
$username = 'root';
$password = ''; // Default XAMPP password is empty

// Create connection using PDO (recommended for security)
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Set error mode to exceptions
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Optional: Disable emulated prepares for security
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    echo "Database connected successfully!"; // Remove this line in production
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}
?>