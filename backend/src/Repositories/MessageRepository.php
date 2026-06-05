<?php

namespace App\Repositories;

use PDO;

class MessageRepository extends BaseRepository
{
    public function sendMessage($chatId, $role, $content)
    {
        $sql = "INSERT INTO messages (chat_id, role, content) VALUES (:chat_id, :role, :content) RETURNING id ";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':chat_id' => $chatId,
            ':role' => $role,
            ':content' => $content
        ]);

        $result = $stmt->fetch();
        return $result['id'];
    }

    public function getLastMessages($chatId, $limit)
    {
        $sql = "SELECT role, content FROM messages WHERE chat_id = :chat_id ORDER BY created_at DESC LIMIT :limit";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':chat_id', $chatId, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        $messages = $stmt->fetchAll();
        return array_reverse($messages);
    }

    public function getMessagesByChatId($chatId)
    {
        $sql = "SELECT id, role, content, created_at FROM messages WHERE chat_id = :chat_id ORDER BY created_at ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':chat_id' => $chatId]);
        return $stmt->fetchAll();
    }

    public function getCountMessagesByChatId($chatId){
        $sql = "SELECT COUNT(*) FROM messages WHERE chat_id = :chat_id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':chat_id' => $chatId]);
        return $stmt->fetchColumn();  
    }
}