<?php

namespace App\Repositories;

class ChatRepository extends BaseRepository
{
    public function createChat($userId, $title = 'Новый чат')
    {
        $sql = "INSERT INTO chats (user_id, title) VALUES (:user_id, :title) RETURNING id";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':user_id' => $userId,
            ':title' => $title ?? 'Новый чат'
        ]);

        $result = $stmt->fetch();
        return $result['id'];
    }

    public function deleteChat($chatId)
    {
        $sql = "DELETE FROM chats WHERE id = :id ";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([':id' => $chatId]);

        return $stmt->rowCount() > 0;
    }

    public function updateChatTitle($chatId, $title)
    {
        $sql = "UPDATE chats SET title = :title WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':title' => $title,
            ':id' => $chatId
        ]);
        
        return $stmt->rowCount() > 0;
    }

    public function getChatsByUserId($userId)
    {
        $sql = "SELECT id, title, created_at, updated_at FROM chats WHERE user_id = :user_id ORDER BY updated_at DESC";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([':user_id' => $userId]);

        return $stmt->fetchAll();
    }

    public function getChatById($chatId)
    {
        $sql = "SELECT id, user_id, title FROM chats WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([':id' => $chatId]);

        return $stmt->fetch();
    }

    public function getSearchedChats($userId, $searchQuery)
    {
        $escaped = addcslashes($searchQuery, '%_\\');
        $sql = "SELECT id, title, updated_at, similarity(title, :search_original) as rank 
                FROM chats
                WHERE user_id = :user_id AND title ILIKE CONCAT('%', :escaped::text, '%')
                ORDER BY 
                    (title ILIKE CONCAT(:escaped::text, '%')) DESC,
                    rank DESC,
                    updated_at DESC
                LIMIT 20";

        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':user_id' => $userId,
            ':search_original' => $searchQuery,
            ':escaped' => $escaped
        ]);

        return $stmt->fetchAll();
    }

    public function updateTimestamp($chatId)
    {
        $sql = "UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $chatId]);
    }
}