<?php
namespace App\Repositories;

class UserRepository extends BaseRepository
{

    public function createUser($username, $passwordHash)
    {
        $sql = "INSERT INTO users (username, password_hash) VALUES (:username, :password_hash) RETURNING id";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':username' => $username,
            ':password_hash' => $passwordHash
        ]);

        $result = $stmt->fetch();
        return $result['id'];
    }

    public function findUserByUsername($username)
    {
        $sql = "SELECT id, username, password_hash FROM users WHERE username = :username";
        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([':username' => $username]);
        return $stmt->fetch();
    }
}
