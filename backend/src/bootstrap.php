<?php
require_once __DIR__ . '/../vendor/autoload.php';
use App\Services\JWTService;
use App\Middleware\AuthMiddleware;

// отключаем все буферизации для SSE
@ini_set('output_buffering', 'Off');
@ini_set('zlib.output_compression', 'Off');
@ini_set('implicit_flush', '1');

while (ob_get_level() > 0) {
    ob_end_flush();
}
ob_implicit_flush(true);

// загрузка .env — ищем в нескольких местах
$envPaths = [
    __DIR__ . '/../.env',
    __DIR__ . '/../../.env',
    dirname(__DIR__) . '/.env',
    getcwd() . '/.env'
];

$envLoaded = false;
foreach ($envPaths as $envPath) {
    if (file_exists($envPath) && is_readable($envPath)) {
        $lines = file($envPath);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') === false) continue;
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (!empty($key)) {
                putenv("$key=$value");
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
        $envLoaded = true;
        break;
    }
}

if (!$envLoaded) {
    error_log('WARNING: .env file not found in any of: ' . implode(', ', $envPaths));
}

require_once __DIR__ . '/../config/db_connection.php';

try {
    $jwtService = new JWTService();
    $authMiddleware = new AuthMiddleware($jwtService);
} catch (Exception $e) {
    error_log('JWT init error: ' . $e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Server configuration error']);
    exit;
}