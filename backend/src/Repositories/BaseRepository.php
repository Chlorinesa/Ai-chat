<?php
namespace App\Repositories;
use PDO;

class BaseRepository
{
    protected PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }
}
