<?php
session_start();

define('APP_NAME', 'Imóveis Angola');
define('APP_URL', 'http://localhost/prototipo-imoveis');
define('CURRENCY', 'Kz');

define('DB_HOST', 'localhost');
define('DB_NAME', 'imoveis_angola');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');
define('DEFAULT_COMMISSION', 10);
define('BANK_NAME', 'Banco de Fomento Angola (BFA)');
define('BANK_IBAN', 'AO06 0000 0000 0000 0000 0000 0');
define('BANK_ACCOUNT', 'Imóveis Angola, Lda');

date_default_timezone_set('Africa/Luanda');

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function formatMoney($value): string {
    return number_format((float)$value, 0, ',', '.') . ' ' . CURRENCY;
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
    $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
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
