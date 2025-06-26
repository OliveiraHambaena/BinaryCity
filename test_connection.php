<?php
require_once 'backend\db.php'; // Path to your db.php

// Test query
try {
    $stmt = $pdo->query("SELECT * FROM clients LIMIT 1");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    print_r($result); // Should show the first client if data exists
} catch (PDOException $e) {
    die("Query failed: " . $e->getMessage());
}
