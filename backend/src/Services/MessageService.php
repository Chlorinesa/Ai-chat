<?php

namespace App\Services;

use Exception;

class MessageService
{
    private $messageRepository;
    private $chatService;

    private string $lmStudioUrl = 'http://localhost:1234/v1/chat/completions';
    private string $modelName   = 'gemma-3';

    public function __construct($messageRepository, $chatService)
    {
        $this->messageRepository = $messageRepository;
        $this->chatService = $chatService;
    }

    private function callLmStudio(array $messages, float $temperature = 0.7, int $maxTokens = 1024)
    {
        $cleanMessages = [];
        foreach ($messages as $msg) {
            $cleanMessages[] = [
                'role'=> $msg['role'],
                'content' => mb_convert_encoding($msg['content'], 'UTF-8', 'UTF-8')
            ];
        }

        $payload = json_encode([
            'model' => $this->modelName,
            'messages'=> array_values($cleanMessages),
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

        $logEntry = sprintf("[%s] \n%s\n\n", date('Y-m-d H:i:s') , $payload);
        file_put_contents(__DIR__ . '/../../logs/prompt.log', $logEntry, FILE_APPEND);

        $options = [
            'http' => [
                'header' => "Content-Type: application/json\r\n",
                'method' => 'POST',
                'content' => $payload,
                'timeout' => 120,
            ]
        ];

        $context  = stream_context_create($options);
        $response = @file_get_contents($this->lmStudioUrl, false, $context);

        if ($response === false) {
            throw new Exception('AI service unavailable', 503);
        }

        $result = json_decode($response, true);
        $content = $result['choices'][0]['message']['content'] ?? null;

        if ($content === null) {
            throw new Exception('Invalid AI response format', 500);
        }

        return $content;
    }

    private function callLmStudioStream(array $messages, callable $onChunk, float $temperature = 0.7, int $maxTokens = 1024): ?string
    {
        $cleanMessages = [];
        foreach ($messages as $msg) {
            $cleanMessages[] = [
                'role'=> $msg['role'],
                'content' => mb_convert_encoding($msg['content'], 'UTF-8', 'UTF-8')
            ];
        }

        $payload = json_encode([
            'model' => $this->modelName,
            'messages'=> array_values($cleanMessages),
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
            'stream' => true
        ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

        $logEntry = sprintf("[STREAMING %s] \n%s\n\n", date('Y-m-d H:i:s') , $payload);
        file_put_contents(__DIR__ . '/../../logs/prompt.log', $logEntry, FILE_APPEND);

        $options = [
            'http' => [
                'header' => "Content-Type: application/json\r\nAccept: text/event-stream\r\n",
                'method' => 'POST',
                'content' => $payload,
                'timeout' => 300,
                'ignore_errors' => true
            ]
        ];

        $context  = stream_context_create($options);
        $stream = @fopen($this->lmStudioUrl, 'r', false, $context);

        if (!$stream) {
            throw new Exception('AI service unavailable', 503);
        }

        $meta = stream_get_meta_data($stream);
        $statusLine = $meta['wrapper_data'][0] ?? '';
        if (strpos($statusLine, '200') === false && strpos($statusLine, 'HTTP') !== false) {
            $body = stream_get_contents($stream);
            fclose($stream);
            throw new Exception("LM Studio error: $statusLine. Body: $body", 500);
        }
        $buffer = '';
        $fullContent = '';
        $clientAborted = false;
        $chunkCount = 0;

        while (!feof($stream)) {
            if (connection_aborted()) {
                $clientAborted = true;
                break;
            }

            $chunk = fread($stream, 4096);
            if ($chunk === false || $chunk === '') {
                usleep(1000);
                continue;
            }

            $buffer .= $chunk;

            while (($pos = strpos($buffer, "\n\n")) !== false) {
                $eventBlock = substr($buffer, 0, $pos);
                $buffer = substr($buffer, $pos + 2);

                $lines = explode("\n", $eventBlock);
                $eventData = '';

                foreach ($lines as $line) {
                    $line = trim($line);
                    if (str_starts_with($line, 'data:')) {
                        $eventData = trim(substr($line, 5));
                    }
                }

                if ($eventData === '' || $eventData === '[DONE]') {
                    continue;
                }

                $data = json_decode($eventData, true);
                if (!$data) {
                    continue;
                }

                $deltaContent = $data['choices'][0]['delta']['content'] ?? '';

                if ($deltaContent !== '') {
                    $fullContent .= $deltaContent;
                    $onChunk($deltaContent);  
                    $chunkCount++;

                    if (connection_aborted()) {
                        $clientAborted = true;
                        break 2;  
                    }

                    if ($chunkCount % 5 === 0) {
                        usleep(1000);
                    }
                }
            }
        }

        fclose($stream);

        if ($clientAborted) {
            return null;
        }

        return $fullContent;
    }


    public function sendMessageStream($chatId, $userId, string $message)
    {
        if (!$this->chatService->chatBelongsToUser($chatId, $userId)) {
            $this->sendSseEvent('error', ['message' => 'Chat not found or access denied']);
            return;
        }
        $this->messageRepository->sendMessage($chatId, 'user', $message);

        $history = $this->messageRepository->getLastMessages($chatId, 20);

        $messages = [
            [
                'role' => 'system',
                'content' => 'You are a helpful assistant. Answer briefly. Do not use markdown. Do not start with "Ассистент:".'
            ]
        ];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        header('Connection: keep-alive');
        header('X-Accel-Buffering: no');

        while (ob_get_level() > 0) {
            ob_end_flush();
        }
        ob_implicit_flush(true);

        $this->sendSseEvent('start', ['chat_id' => $chatId]);

        $fullResponse = '';

        try {
            $fullResponse = $this->callLmStudioStream($messages, function($chunk) {
                $this->sendSseEvent('chunk', ['content' => $chunk]);
            }, 0.7, 1024);

            if ($fullResponse === null) {
                $this->sendSseEvent('done', ['chat_id' => $chatId, 'cancelled' => true]);
                exit;
            }

            if (connection_aborted()) {
                $this->sendSseEvent('done', ['chat_id' => $chatId, 'cancelled' => true]);
                exit;
            }

            if (!empty($fullResponse)) {
                $this->messageRepository->sendMessage($chatId, 'assistant', $fullResponse);
                $this->chatService->updateChatTimestamp($chatId);
                $this->maybeRenameChat($chatId);
            }

            $this->sendSseEvent('done', ['chat_id' => $chatId]);
            exit;

        } catch (Exception $e) {
            $this->sendSseEvent('error', ['message' => $e->getMessage()]);
            exit;
        }
    }

    private function sendSseEvent(string $event, array $data): void
    {
        echo "event: $event\n";
        echo "data: " . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";

        if (function_exists('ob_flush')) @ob_flush();
        if (function_exists('flush')) @flush();
    }

    public function getChatHistory($chatId, $userId)
    {
        if (!$this->chatService->chatBelongsToUser($chatId, $userId)) {
            throw new Exception('Chat not found or access denied', 403);
        }
        return $this->messageRepository->getMessagesByChatId($chatId);
    }

    public function getCountMessagesByChatId($chatId)
    {
        return $this->messageRepository->getCountMessagesByChatId($chatId);
    }

    private function maybeRenameChat($chatId)
    {
        $chat = $this->chatService->getChatById($chatId);
        $messagesCount = $this->getCountMessagesByChatId($chatId);

        if ($chat['title'] === 'Новый чат' && $messagesCount >= 4) {
            $newTitle = $this->getNewTitleFromAi($chatId);

            if (!empty($newTitle) && strlen($newTitle) <= 100 && $newTitle !== 'Новый чат') {
                $this->chatService->updateChatTitle($chatId, $newTitle);
            }
        }
    }

    public function getNewTitleFromAi($chatId)
    {
        try {
            $history = $this->messageRepository->getMessagesByChatId($chatId);

            if (empty($history)) {
                return 'Новый чат';
            }

            $messages = [
                [
                    'role' => 'system',
                    'content' => 'Ты генератор названий чатов. Отвечай только названием (1-4 слова), без пояснений, без markdown, без ролей, без кавычек.'
                ]
            ];

            foreach ($history as $msg) {
                $cleanContent = preg_replace('/[^\P{C}\n\r\t]/u', '', $msg['content']);
                $cleanContent = substr($cleanContent, 0, 150);

                $messages[] = [
                    'role' => $msg['role'],
                    'content' => $cleanContent
                ];
            }

            $messages[] = [
                'role' => 'user',
                'content' => 'Придумай короткое название для этого чата (1-4 слова):'
            ];

            $title = $this->callLmStudio($messages, 0.4, 40);

            $title = preg_replace('/^(Ассистент|Пользователь|User|Assistant)[\s:]*/i', '', $title);
            $title = trim($title, "\"\' \n\r\t:—-");

            $lines = explode("\n", $title);
            $title = rtrim(trim($lines[0]), ':');

            if (empty($title) || strlen($title) > 100 || substr_count($title, ' ') > 6 || strtolower($title) === 'ассистент') {
                return 'Новый чат';
            }

            return $title;
        } catch (Exception $e) {
            return 'Новый чат';
        }
    }
}