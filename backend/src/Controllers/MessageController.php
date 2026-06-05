<?php

namespace App\Controllers;

use Exception;

class MessageController
{
    private $messageService;

    public function __construct($messageService)
    {
        $this->messageService = $messageService;
    }

    public function sendMessage($chatId)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $message = $input['message'] ?? '';
        $userId = $_SERVER['AUTH_USER_ID'];

        if (!$chatId || !$message) {
            http_response_code(400);
            echo json_encode(['error' => 'chat_id and message are required']);
            return;
        }
        try {
            $aiResponse = $this->messageService->sendMessage($chatId, $userId, $message);
            http_response_code(200);
            echo json_encode(['success' => true, 'response' => $aiResponse]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    /**
     * STREAMING endpoint
     */
    public function sendMessageStream($chatId)
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $message = $input['message'] ?? '';
        $userId = $_SERVER['AUTH_USER_ID'];

        if (!$chatId || !$message) {
            header('Content-Type: text/event-stream');
            echo "event: error\ndata: " . json_encode(['message' => 'chat_id and message are required']) . "\n\n";
            return;
        }

        $this->messageService->sendMessageStream($chatId, $userId, $message);
    }

    public function getMessages($chatId)
    {
        $userId = $_SERVER['AUTH_USER_ID'];
        try {
            $history = $this->messageService->getChatHistory($chatId, $userId);
            http_response_code(200);
            echo json_encode(['success' => true, 'messages' => $history]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}