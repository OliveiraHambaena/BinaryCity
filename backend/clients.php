<?php
require_once 'db.php';

if ($_GET['action'] === 'list') {
    $stmt = $pdo->query("SELECT id, name, code FROM clients ORDER BY name ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_GET['action'] === 'add' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    if ($name === '') {
        echo json_encode(['success' => false, 'error' => 'Name is required.']);
        exit;
    }

    // Generate code: 3 uppercase letters from name, padded if needed
    $letters = strtoupper(preg_replace('/[^A-Z]/', '', substr($name, 0, 3)));
    $letters = str_pad($letters, 3, 'A');

    // Find max code with these letters
    $stmt = $pdo->prepare("SELECT code FROM clients WHERE code LIKE ? ORDER BY code DESC LIMIT 1");
    $stmt->execute([$letters . '%']);
    $lastCode = $stmt->fetchColumn();
    $num = 1;
    if ($lastCode) {
        $lastNum = intval(substr($lastCode, 3));
        $num = $lastNum + 1;
    }
    $code = $letters . str_pad($num, 3, '0', STR_PAD_LEFT);

    // Insert client
    $stmt = $pdo->prepare("INSERT INTO clients (name, code) VALUES (?, ?)");
    try {
        $stmt->execute([$name, $code]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Error saving client.']);
    }
    exit;
}
