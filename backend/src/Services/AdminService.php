<?php
namespace App\Services;
use Exception;
use PDOException;

class AdminService
{
    private $userRepository;
    private $chatRepository;
    private $messageRepository;

    public function __construct($userRepository, $chatRepository, $messageRepository)
    {
        $this->userRepository = $userRepository;
        $this->chatRepository = $chatRepository;
        $this->messageRepository = $messageRepository;
    }

    public function getUsers($page = 1, $perPage = 10)
    {
        $page = max(1, (int)$page);
        $perPage = max(1, min(100, (int)$perPage));
        $offset = ($page - 1) * $perPage;

        $users = $this->userRepository->getAllUsers($perPage, $offset);
        $total = $this->userRepository->getUsersCount();

        return [
            'users' => $users,
            'total' => (int)$total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => (int)ceil($total / $perPage)
        ];
    }

    public function createUser($username, $password, $role = 'user')
    {
        if (strlen($username) < 3) {
            throw new Exception('Username too short', 400);
        }
        if (strlen($password) < 4) {
            throw new Exception('Password too short', 400);
        }
        if (!in_array($role, ['user', 'admin'])) {
            throw new Exception('Invalid role', 400);
        }

        if ($this->userRepository->usernameExists($username)) {
            throw new Exception('Username already exists', 409);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $userId = $this->userRepository->createUser($username, $hash, $role);

        return ['id' => $userId, 'username' => $username, 'role' => $role];
    }

    public function updateUser($id, $data)
    {
        $user = $this->userRepository->findUserById($id);
        if (!$user) {
            throw new Exception('User not found', 404);
        }

        $updateData = [];

        if (isset($data['username'])) {
            if (strlen($data['username']) < 3) {
                throw new Exception('Username too short', 400);
            }
            if ($this->userRepository->usernameExists($data['username'], $id)) {
                throw new Exception('Username already exists', 409);
            }
            $updateData['username'] = $data['username'];
        }

        if (isset($data['role'])) {
            if (!in_array($data['role'], ['user', 'admin'])) {
                throw new Exception('Invalid role', 400);
            }
            $updateData['role'] = $data['role'];
        }

        if (isset($data['password']) && !empty($data['password'])) {
            if (strlen($data['password']) < 4) {
                throw new Exception('Password too short', 400);
            }
            $updateData['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        if (empty($updateData)) {
            throw new Exception('No fields to update', 400);
        }

        $this->userRepository->updateUser($id, $updateData);
        return $this->userRepository->findUserById($id);
    }

    public function deleteUser($id)
    {
        $user = $this->userRepository->findUserById($id);
        if (!$user) {
            throw new Exception('User not found', 404);
        }

        $this->userRepository->deleteUser($id);
        return ['success' => true];
    }

    public function getStats()
    {
        return [
            'total_users' => (int)$this->userRepository->getUsersCount(),
            'total_chats' => (int)$this->chatRepository->getTotalChats(),
            'total_messages' => (int)$this->messageRepository->getTotalMessages(),
            'messages_today' => (int)$this->messageRepository->getMessagesToday(),
            'messages_by_day' => $this->messageRepository->getMessagesCountByDay(30),
            'top_users' => $this->messageRepository->getMessagesCountByUser(5)
        ];
    }
}