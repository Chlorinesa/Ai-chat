<?php
namespace App\Controllers;
use Exception;

class AdminController
{
    private $adminService;

    public function __construct($adminService)
    {
        $this->adminService = $adminService;
    }

    public function getUsers()
    {
        $page = (int)($_GET['page'] ?? 1);
        $perPage = (int)($_GET['per_page'] ?? 10);

        try {
            $result = $this->adminService->getUsers($page, $perPage);
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $result]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function createUser()
    {
        $input = json_decode(file_get_contents('php://input'), true);
        $username = $input['username'] ?? '';
        $password = $input['password'] ?? '';
        $role = $input['role'] ?? 'user';

        try {
            $user = $this->adminService->createUser($username, $password, $role);
            http_response_code(201);
            echo json_encode(['success' => true, 'user' => $user]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function updateUser($id)
    {
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            $user = $this->adminService->updateUser($id, $input);
            http_response_code(200);
            echo json_encode(['success' => true, 'user' => $user]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function deleteUser($id)
    {
        try {
            $result = $this->adminService->deleteUser($id);
            http_response_code(200);
            echo json_encode($result);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    public function getStats()
    {
        try {
            $stats = $this->adminService->getStats();
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $stats]);
        } catch (Exception $e) {
            http_response_code($e->getCode() ?: 500);
            echo json_encode(['error' => $e->getMessage()]);
        }
    }
}