<?php

namespace App\Controllers;

class ChatController
{
    private $chatService;

    public function __construct($chatService)
    {
        $this->chatService = $chatService;
    }

    public function createChat()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? 'Новый чат';
        if ($title === '') {
            $title = 'Новый чат';
        }
        $userId = $_SERVER['AUTH_USER_ID'];
        $chatId = $this->chatService->createChat($userId, $title);
        http_response_code(201);
        echo json_encode(['success' => true, 'chat_id' => $chatId]);
    }
    public function deleteChat($chatId)
    {
        $userId = $_SERVER['AUTH_USER_ID'];

        if (!$chatId) {
            http_response_code(400);
            echo json_encode(['error' => 'chat_id is required']);
            return;
        }
        try {
            $this->chatService->deleteChat($chatId, $userId);
            http_response_code(200);
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getChats()
    {
        $userId = $_SERVER['AUTH_USER_ID'];
        $chats = $this->chatService->getChats($userId);
        http_response_code(200);
        echo json_encode(['success' => true, 'chats' => $chats]);
    }

    public function getSearchedChats()
    {
        $searchQuery = trim($_GET['q'] ?? '');
        $userId = $_SERVER['AUTH_USER_ID'];
        if ($searchQuery === '') {
            $chats = $this->chatService->getChats($userId);
            echo json_encode(['success' => true, 'chats' => $chats]);
            return;
        }

        $chats = $this->chatService->getSearchedChats($userId, $searchQuery);
        echo json_encode(['success' => true, 'query' => $searchQuery, 'chats' => $chats]);
    }
}
