<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../src/bootstrap.php';

use App\Repositories\UserRepository;
use App\Repositories\ChatRepository;
use App\Repositories\MessageRepository;
use App\Services\AuthService;
use App\Services\ChatService;
use App\Services\MessageService;
use App\Services\AdminService;
use App\Controllers\AuthController;
use App\Controllers\ChatController;
use App\Controllers\MessageController;
use App\Controllers\AdminController;
use App\Middleware\AdminMiddleware;

header('Content-Type: application/json');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// === Репозитории ===
$userRepository = new UserRepository($pdo);
$chatRepository = new ChatRepository($pdo);
$messageRepository = new MessageRepository($pdo);

// === Сервисы ===
$authService = new AuthService($userRepository, $jwtService);
$chatService = new ChatService($chatRepository);
$messageService = new MessageService($messageRepository, $chatService);
$adminService = new AdminService($userRepository, $chatRepository, $messageRepository);

// === Контроллеры ===
$authController = new AuthController($authService);
$chatController = new ChatController($chatService);
$messageController = new MessageController($messageService);
$adminController = new AdminController($adminService);

// === Middleware ===
$adminMiddleware = new AdminMiddleware($jwtService);

// === Публичные роуты ===
if ($path === '/auth/register' && $method === 'POST') {
    $authController->register();
    exit;
}
if ($path === '/auth/login' && $method === 'POST') {
    $authController->login();
    exit;
}

// === Защищённые роуты (требуют JWT) ===
$authMiddleware->handle();

// --- Чаты и сообщения (для всех авторизованных) ---
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

// === Админ роуты (требуют role = admin) ===
elseif (preg_match('#^/admin/users$#', $path)) {
    $adminMiddleware->handle();
    if ($method === 'GET') {
        $adminController->getUsers();
    } elseif ($method === 'POST') {
        $adminController->createUser();
    }
}
elseif (preg_match('#^/admin/users/(\d+)$#', $path, $matches)) {
    $adminMiddleware->handle();
    if ($method === 'PATCH') {
        $adminController->updateUser($matches[1]);
    } elseif ($method === 'DELETE') {
        $adminController->deleteUser($matches[1]);
    }
}
elseif ($path === '/admin/stats' && $method === 'GET') {
    $adminMiddleware->handle();
    $adminController->getStats();
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}