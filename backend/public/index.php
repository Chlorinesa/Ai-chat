<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../src/bootstrap.php';

use App\Repositories\UserRepository;
use App\Repositories\ChatRepository;
use App\Repositories\MessageRepository;
use App\Services\AuthService;
use App\Services\ChatService;
use App\Services\MessageService;
use App\Controllers\AuthController;
use App\Controllers\ChatController;
use App\Controllers\MessageController;

header('Content-Type: application/json');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$userRepository = new UserRepository($pdo);
$authService = new AuthService($userRepository, $jwtService);
$authController = new AuthController($authService);

$chatRepository = new ChatRepository($pdo);
$chatService = new ChatService($chatRepository);
$chatController = new ChatController($chatService);

$messageRepository = new MessageRepository($pdo);
$messageService = new MessageService($messageRepository, $chatService);
$messageController = new MessageController($messageService);

if ($path === '/auth/register' && $method === 'POST') {
    $authController->register();
    exit;
}
if ($path === '/auth/login' && $method === 'POST') {
    $authController->login();
    exit;
}

$authMiddleware->handle();

if ($path === '/chats') {
    if ($method === 'GET') {
       if (isset($_GET['q'])) {
            $chatController->getSearchedChats();     
        } else {
            $chatController->getChats(); 
        }
    } elseif ($method === 'POST') {
        $chatController->createChat();
    }
} 
elseif (preg_match('#^/chats/(\d+)$#', $path, $matches) && $method === 'DELETE') {
    $chatController->deleteChat($matches[1]);
}
elseif (preg_match('#^/chats/(\d+)/messages$#', $path, $matches)) {
    if ($method === 'GET') {
        $messageController->getMessages($matches[1]);
    } elseif ($method === 'POST') {
        $messageController->sendMessage($matches[1]);
    }
}
elseif (preg_match('#^/chats/(\d+)/messages/stream$#', $path, $matches) && $method === 'POST') {
    $messageController->sendMessageStream($matches[1]);
    exit;
}
else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}