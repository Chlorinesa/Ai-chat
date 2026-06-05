<?php
namespace App\Middleware;
use Exception;

class AuthMiddleware 
{
    private $jwtService;

    public function __construct($jwtService) 
    {
        $this->jwtService = $jwtService;
    }

    public function handle() 
    {
        try {
            $userId = $this->jwtService->getUserIdFromToken();
            $_SERVER['AUTH_USER_ID'] = $userId;
            
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => $e->getMessage()]);
            exit; // станавливаем выполнение, если токен плохой
        }
    }
}
