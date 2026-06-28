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

    // админ 
    public function getTotalMessages()
    {
        $sql = "SELECT COUNT(*) FROM messages";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchColumn();
    }

    public function getMessagesCountByDay($days = 7)
    {
        $sql = "SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM messages 
                WHERE created_at >= CURRENT_DATE - INTERVAL '$days days'
                GROUP BY DATE(created_at) 
                ORDER BY date ASC";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }

    public function getMessagesCountByUser($limit = 5)
    {
        $sql = "SELECT u.username, COUNT(m.id) as count 
                FROM users u 
                JOIN chats c ON c.user_id = u.id 
                JOIN messages m ON m.chat_id = c.id 
                GROUP BY u.id, u.username 
                ORDER BY count DESC 
                LIMIT :limit";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getMessagesToday()
    {
        $sql = "SELECT COUNT(*) FROM messages WHERE DATE(created_at) = CURRENT_DATE";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchColumn();
    }
}