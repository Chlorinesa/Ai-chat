<?php
namespace App\Services;
use Exception;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTService
{
    private $secretKey;

    public function __construct()
    {
        $secret  = "qmHdddpbtZ7ZTRztnfUDt8sP0rTpdGr6HwS93cmoLTQtoKqcdQAiw15MBKeU4YzJp9uJ6RwXldekY2K5FbPviAii";
        if ($secret === '' || $secret === false) {
            throw new \RuntimeException('JWT_SECRET is not set in .env');
        }
        $this->secretKey = $secret;
    }

    public function encode($userId, $username, $role = 'user')
    {
        $payload = [
            'user_id' => $userId,
            'username' => $username,
            'role' => $role,
            'exp' => time() + 86400
        ];
        return JWT::encode($payload, $this->secretKey, 'HS256');
    }

    public function decode($token)
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));
            return (array)$decoded;
        } catch (Exception $e) {
            return null;
        }
    }

    public function getUserIdFromToken()
    {
        $decoded = $this->getDecodedToken();
        if (!$decoded || !isset($decoded['user_id'])) {
            throw new Exception('Invalid token', 401);
        }
        return $decoded['user_id'];
    }

    public function getUserRoleFromToken()
    {
        $decoded = $this->getDecodedToken();
        if (!$decoded || !isset($decoded['role'])) {
            throw new Exception('Invalid token', 401);
        }
        return $decoded['role'];
    }

    private function getDecodedToken()
    {
        $headers = getallheaders();
        $headers = array_change_key_case($headers, CASE_LOWER);
        $authHeader = $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception('Token required', 401);
        }

        return $this->decode($matches[1]);
    }
}