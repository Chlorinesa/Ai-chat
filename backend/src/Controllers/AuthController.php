<?php
namespace App\Controllers;
use Exception;
use PDOException;

class AuthController
{
    private $authService;

    public function __construct($authService)
    {
        $this->authService = $authService;
    }
    
    public function register()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';

        try {
            $userId = $this->authService->register($username, $password);
            http_response_code(201);
            echo json_encode(['success' => true, 'user_id' => $userId]);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Internal server error']);
        } catch (Exception $e) {
            http_response_code($e->getCode());
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function login()
{
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    try {
        $result = $this->authService->login($username, $password);
        http_response_code(200);
        echo json_encode([
            'success' => true, 
            'token' => $result['token'],
            'user' => $result['user']
        ]);
    } catch (PDOException $e) {
        error_log($e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Internal server error']);
    } catch (Exception $e) {
        http_response_code($e->getCode());
        echo json_encode(['error' => $e->getMessage()]);
    }
}
}