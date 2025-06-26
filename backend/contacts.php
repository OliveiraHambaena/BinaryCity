<?php
require_once 'db.php';

if (isset($_GET['action']) && $_GET['action'] === 'list') {
    $stmt = $pdo->query("SELECT id, name, surname, email FROM contacts ORDER BY name ASC, surname ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'add' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $surname = trim($_POST['surname'] ?? '');
    $email = trim($_POST['email'] ?? '');

    if ($name === '' || $surname === '' || $email === '') {
        echo json_encode(['success' => false, 'error' => 'All fields are required.']);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Invalid email.']);
        exit;
    }
    // Check unique email
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM contacts WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['success' => false, 'error' => 'Email already exists.']);
        exit;
    }
    // Insert contact
    $stmt = $pdo->prepare("INSERT INTO contacts (name, surname, email) VALUES (?, ?, ?)");
    try {
        $stmt->execute([$name, $surname, $email]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error saving contact.']);
    }
    exit;
}
