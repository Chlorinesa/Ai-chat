<?php

namespace App\Services;

class ChatService
{
    private $chatRepository;

    public function __construct($chatRepository)
    {
        $this->chatRepository = $chatRepository;
    }

    public function createChat($userId, $title = 'Новый чат')
    {
        return $this->chatRepository->createChat($userId, $title);
    }

    public function deleteChat($chatId, $userId)
    {
        if (!$this->chatBelongsToUser($chatId, $userId)) {
            throw new \Exception('Chat not found or access denied', 403);
        }
        return $this->chatRepository->deleteChat($chatId);
    }

    public function getChats($userId)
    {
        return $this->chatRepository->getChatsByUserId($userId);
    }

    public function chatBelongsToUser($chatId, $userId)
    {
        $chat = $this->chatRepository->getChatById($chatId);
        return $chat && $chat['user_id'] == $userId;
    }

    public function getChatById($chatId)
    {
        return $this->chatRepository->getChatById($chatId);
    }

    public function updateChatTitle($chatId, $title)
    {
        return $this->chatRepository->updateChatTitle($chatId, $title);
    }

    public function getSearchedChats($userId, $searchQuery)
    {
        return $this->chatRepository->getSearchedChats($userId, $searchQuery);
    }

    public function updateChatTimestamp($chatId)
    {
        $this->chatRepository->updateTimestamp($chatId);
    }
}