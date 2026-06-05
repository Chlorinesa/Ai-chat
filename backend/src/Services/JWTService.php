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
        // $secret  = getenv('JWT_SECRET');
        $secret  = "qmHdddpbtZ7ZTRztnfUDt8sP0rTpdGr6HwS93cmoLTQtoKqcdQAiw15MBKeU4YzJp9uJ6RwXldekY2K5FbPviAii";
        if ($secret === '' || $secret === false) {
            throw new \RuntimeException('JWT_SECRET is not set in .env');
        }
        $this->secretKey = $secret;
    }

    public function encode($userId, $username)
    {
        $payload = [
            'user_id' => $userId,
            'username' => $username,
            'exp' => time() + 86400 //24 часа
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
        $headers = getallheaders();
        $headers = array_change_key_case($headers, CASE_LOWER);
        $authHeader = $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            throw new Exception('Token required', 401);
        }

        $token = $matches[1];
        $decoded = $this->decode($token);

        if (!$decoded || !isset($decoded['user_id'])) {
            throw new Exception('Invalid token', 401);
        }

        return $decoded['user_id'];
    }
}
