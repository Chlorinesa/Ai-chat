<?php
namespace App\Services;
use Exception;
use PDOException;

class AuthService
{
    private $userRepository;
    private $jwtService;

    public function __construct($userRepository, $jwtService)
    {
        $this->userRepository = $userRepository;
        $this->jwtService = $jwtService;
    }

    public function register($username, $password)
    {
        if (strlen($username) < 3) {
            throw new Exception('Username too short', 400);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        try {
            $userId = $this->userRepository->createUser($username, $hash);
        } catch (PDOException $e) {
            if ($e->getCode() == 23505) {
                throw new Exception('Username already exists', 409);
            }
            throw $e;
        }

        return $userId;
    }

    public function login($username, $password)
    {
        if (empty($username) || empty($password)) {
            throw new Exception('Username and password are required', 400);
        }

        $user = $this->userRepository->findUserByUsername($username);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new Exception('Invalid credentials', 401);
        }

        return $this->jwtService->encode($user['id'], $user['username']);
    }
}

