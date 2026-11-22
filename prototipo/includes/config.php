<?php
session_start();

define('APP_NAME', 'Imóveis Angola');
define('APP_URL', rtrim(getenv('APP_URL') ?: 'http://127.0.0.1:8080', '/'));
define('CURRENCY', 'Kz');
define('DB_PATH', __DIR__ . '/../data/imoveis.db');
define('USE_MYSQL', getenv('USE_MYSQL') === '1');
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'imoveis_angola');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

date_default_timezone_set('Africa/Luanda');

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        if (USE_MYSQL) {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } else {
            $dir = dirname(DB_PATH);
            if (!is_dir($dir)) mkdir($dir, 0755, true);
            $pdo = new PDO('sqlite:' . DB_PATH, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            $pdo->exec('PRAGMA foreign_keys = ON');
        }
    }
    return $pdo;
}

function formatMoney($value): string {
    return number_format((float)$value, 0, ',', '.') . ' Kz';
}

function e(?string $str): string {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): void {
    header('Location: ' . APP_URL . $path);
    exit;
}

function isLoggedIn(): bool {
    return isset($_SESSION['user_id']);
}

function currentUser(): ?array {
    if (!isLoggedIn()) return null;
    static $user = null;
    if ($user === null) {
        $stmt = db()->prepare('SELECT id, name, email, phone, role FROM users WHERE id = ? AND is_active = 1');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch() ?: null;
        if (!$user) unset($_SESSION['user_id']);
    }
    return $user;
}

function requireLogin(): void {
    if (!isLoggedIn()) redirect('/login.php');
}

function requireRole(string ...$roles): void {
    requireLogin();
    $user = currentUser();
    if (!$user || !in_array($user['role'], $roles, true)) redirect('/dashboard.php');
}

function flash(string $type, string $message): void {
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function getFlash(): ?array {
    if (!isset($_SESSION['flash'])) return null;
    $f = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $f;
}

function slugify(string $text): string {
    $text = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text) ?: $text;
    $text = strtolower(preg_replace('/[^a-z0-9]+/', '-', $text));
    return trim($text, '-');
}

$typeLabels = [
    'APARTMENT' => 'Apartamento', 'HOUSE' => 'Casa', 'VILLA' => 'Vivenda',
    'STUDIO' => 'Estúdio', 'COMMERCIAL' => 'Comercial', 'LAND' => 'Terreno',
    'OFFICE' => 'Escritório', 'WAREHOUSE' => 'Armazém',
];

$statusLabels = [
    'DRAFT' => 'Rascunho', 'PENDING_VERIFICATION' => 'Pendente',
    'CORRECTIONS_REQUESTED' => 'Correcções', 'APPROVED' => 'Aprovado',
    'PUBLISHED' => 'Publicado', 'REJECTED' => 'Rejeitado',
    'SUSPENDED' => 'Suspenso', 'RENTED' => 'Arrendado',
];
