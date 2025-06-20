<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$accounts_file = 'accounts.json';

// Add error logging
error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request headers: " . print_r(getallheaders(), true));

function loadAccounts() {
    global $accounts_file;
    if (file_exists($accounts_file)) {
        $json = file_get_contents($accounts_file);
        return json_decode($json, true) ?: [];
    }
    return [];
}

function saveAccounts($accounts) {
    global $accounts_file;
    return file_put_contents($accounts_file, json_encode($accounts, JSON_PRETTY_PRINT));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Debug: Log raw input
    $raw_input = file_get_contents('php://input');
    error_log("Raw POST input: " . $raw_input);
    
    $input = json_decode($raw_input, true);
    error_log("Decoded input: " . print_r($input, true));
    
    if (!$input) {
        error_log("Failed to decode JSON input");
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input', 'raw_input' => $raw_input]);
        exit;
    }
    
    if (!isset($input['email'])) {
        error_log("Missing email field in input");
        http_response_code(400);
        echo json_encode(['error' => 'Missing email field', 'received_fields' => array_keys($input)]);
        exit;
    }
    
    $accounts = loadAccounts();
    error_log("Loaded accounts: " . print_r($accounts, true));
    
    // Check if account already exists
    $exists = false;
    foreach ($accounts as &$account) {
        if ($account['email'] === $input['email']) {
            // Update existing account
            $account = array_merge($account, $input);
            $account['last_login'] = date('Y-m-d H:i:s');
            $exists = true;
            error_log("Updated existing account for email: " . $input['email']);
            break;
        }
    }
    
    if (!$exists) {
        // Add new account
        $input['created_at'] = date('Y-m-d H:i:s');
        $input['last_login'] = date('Y-m-d H:i:s');
        $accounts[] = $input;
        error_log("Added new account for email: " . $input['email']);
    }
    
    if (saveAccounts($accounts)) {
        error_log("Successfully saved accounts");
        echo json_encode(['success' => true, 'message' => 'Account saved successfully']);
    } else {
        error_log("Failed to save accounts to file");
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save account']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Return all accounts (for debugging - remove in production)
    $accounts = loadAccounts();
    echo json_encode($accounts);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>