<?php
namespace App\Middleware;
use Exception;

class AdminMiddleware 
{
    private $jwtService;

    public function __construct($jwtService) 
    {
        $this->jwtService = $jwtService;
    }

    public function handle() 
    {
        try {
            $role = $this->jwtService->getUserRoleFromToken();
            
            if ($role !== 'admin') {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Admin access required']);
                exit;
            }

            $userId = $this->jwtService->getUserIdFromToken();
            $_SERVER['AUTH_USER_ID'] = $userId;
            $_SERVER['AUTH_USER_ROLE'] = $role;
            
        } catch (Exception $e) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }
}