<?php
namespace App\Repositories;

class UserRepository extends BaseRepository
{

    public function createUser($username, $passwordHash, $role = 'user')
    {
        $sql = "INSERT INTO users (username, password_hash, role) VALUES (:username, :password_hash, :role) RETURNING id";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':username' => $username,
            ':password_hash' => $passwordHash,
            ':role' => $role
        ]);

        $result = $stmt->fetch();
        return $result['id'];
    }

    public function findUserByUsername($username)
    {
        $sql = "SELECT id, username, password_hash, role FROM users WHERE username = :username";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([':username' => $username]);
        return $stmt->fetch();
    }

    public function findUserById($id)
    {
        $sql = "SELECT id, username, role, created_at FROM users WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function getAllUsers($limit = 10, $offset = 0)
    {
        $sql = "SELECT u.id, u.username, u.role, u.created_at,
                       COUNT(DISTINCT c.id) as chats_count,
                       COUNT(DISTINCT m.id) as messages_count
                FROM users u
                LEFT JOIN chats c ON c.user_id = u.id
                LEFT JOIN messages m ON m.chat_id = c.id
                GROUP BY u.id
                ORDER BY u.created_at DESC
                LIMIT :limit OFFSET :offset";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':limit', $limit, \PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getUsersCount()
    {
        $sql = "SELECT COUNT(*) FROM users";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchColumn();
    }

    public function updateUser($id, $data)
    {
        $fields = [];
        $params = [':id' => $id];

        if (isset($data['username'])) {
            $fields[] = "username = :username";
            $params[':username'] = $data['username'];
        }
        if (isset($data['role'])) {
            $fields[] = "role = :role";
            $params[':role'] = $data['role'];
        }
        if (isset($data['password_hash'])) {
            $fields[] = "password_hash = :password_hash";
            $params[':password_hash'] = $data['password_hash'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->rowCount() > 0;
    }

    public function deleteUser($id)
    {
        $sql = "DELETE FROM users WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function usernameExists($username, $excludeId = null)
    {
        $sql = "SELECT id FROM users WHERE username = :username";
        $params = [':username' => $username];

        if ($excludeId) {
            $sql .= " AND id != :exclude_id";
            $params[':exclude_id'] = $excludeId;
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch() !== false;
    }
}