<?php
/**
 * Suite de testes automatizados - Imóveis Angola (Protótipo)
 *
 * Uso:
 *   php tests/run.php
 *   php tests/run.php --http
 *   php tests/run.php --http --base=http://127.0.0.1:8080
 */

declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$passed = 0;
$failed = 0;
$errors = [];

function assert_true(bool $cond, string $name): void {
    global $passed, $failed, $errors;
    if ($cond) {
        echo "  ✓ {$name}\n";
        $passed++;
    } else {
        echo "  ✗ {$name}\n";
        $failed++;
        $errors[] = $name;
    }
}

function assert_eq($expected, $actual, string $name): void {
    $ok = $expected === $actual;
    if (!$ok) {
        $name .= " (esperado: " . var_export($expected, true) . ", obtido: " . var_export($actual, true) . ")";
    }
    assert_true($ok, $name);
}

echo "\n========================================\n";
echo "  Imóveis Angola — Testes Automatizados\n";
echo "========================================\n\n";

echo "▶ Formatação monetária (AOA)\n";
assert_eq('250.000 Kz', test_formatMoney(250000), '250000 → 250.000 Kz');
assert_eq('0 Kz', test_formatMoney(0), '0 → 0 Kz');
assert_eq('1.500.000 Kz', test_formatMoney(1500000), '1500000 → 1.500.000 Kz');
assert_eq('100 Kz', test_formatMoney(99.9), '99.9 → 100 Kz (arredonda)');

echo "\n▶ Slugify\n";
$slug = test_slugify('Apartamento T3 Talatona');
assert_true($slug !== '' && !str_contains($slug, ' '), 'slug sem espaços');
assert_true(str_contains($slug, '3') || str_contains($slug, 't3') || strlen($slug) > 5, 'slug tem conteúdo útil');
assert_eq('', test_slugify('!!!'), 'só símbolos → vazio');
$slug2 = test_slugify('Casa ABC 12');
assert_true(preg_match('/^[a-z0-9-]+$/', $slug2) === 1, 'slug só tem a-z0-9-');

echo "\n▶ Escape HTML (XSS)\n";
$escaped = test_e('<' . 'script>alert(1)</' . 'script>');
assert_true(str_contains($escaped, '<') && str_contains($escaped, '>'), 'escapa tags HTML');
assert_true(!str_contains($escaped, '<' . 'script>'), 'não deixa script cru');
assert_eq('', test_e(null), 'null → string vazia');
$amp = test_e('João & Maria');
assert_true(str_contains($amp, '&'), 'escapa ampersand');

echo "\n▶ Cálculo de comissão\n";
assert_eq(45000.0, test_calculateCommission(450000, 10), '10% de 450.000 = 45.000');
assert_eq(50000.0, test_calculateCommission(450000, 10, 5000), '10% + 5.000 fixo');
assert_eq(0.0, test_calculateCommission(0, 10), 'renda 0 → comissão 0');

echo "\n▶ Validação de dados\n";
assert_true(test_validateEmail('maria@email.ao'), 'email válido');
assert_true(!test_validateEmail('invalido'), 'email inválido');
assert_true(test_validatePassword('password'), 'password >= 6');
assert_true(!test_validatePassword('123'), 'password curta rejeitada');
assert_true(test_roleAllowed('ADMIN', ['ADMIN', 'OWNER']), 'role ADMIN permitida');
assert_true(!test_roleAllowed('CLIENT', ['ADMIN']), 'role CLIENT bloqueada');

echo "\n▶ Password bcrypt\n";
$hash = password_hash('password', PASSWORD_BCRYPT);
assert_true(password_verify('password', $hash), 'password_verify correcto');
assert_true(!password_verify('errada', $hash), 'password errada rejeitada');
$demoHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
assert_true(password_verify('password', $demoHash), 'hash de demo no SQL é password');

echo "\n▶ Estrutura de ficheiros\n";
$root = dirname(__DIR__);
$required = [
    'index.php', 'login.php', 'registo.php', 'explorar.php', 'imovel.php',
    'dashboard.php', 'logout.php',
    'includes/config.php', 'includes/header.php', 'includes/footer.php',
    'assets/css/style.css', 'sql/schema.sqlite.sql',
    'admin/aprovar.php', 'proprietario/novo-imovel.php',
];
foreach ($required as $file) {
    assert_true(is_file($root . '/' . $file), "existe {$file}");
}

echo "\n▶ Schema SQL\n";
$schema = file_get_contents($root . '/sql/schema.sqlite.sql');
foreach (['CREATE TABLE users', 'CREATE TABLE properties', 'CREATE TABLE visits', 'CREATE TABLE commissions', 'CREATE TABLE payments'] as $table) {
    assert_true(str_contains($schema, $table), "schema tem {$table}");
}
assert_true(str_contains($schema, 'admin@imoveis.ao'), 'schema tem user admin');
assert_true(str_contains($schema, 'PUBLISHED'), 'schema tem status PUBLISHED');

echo "\n▶ Base de dados\n";
$dbPath = $root . '/data/imoveis.db';
$drivers = PDO::getAvailableDrivers();
$hasSqlite = in_array('sqlite', $drivers, true);

if (!$hasSqlite) {
    echo "  ⚠ PDO SQLite não disponível — testes de BD ignorados\n";
} elseif (!is_file($dbPath)) {
    echo "  ⚠ data/imoveis.db não existe — execute schema.sqlite.sql\n";
} else {
    try {
        $pdo = new PDO('sqlite:' . $dbPath, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        $users = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        assert_true($users >= 3, "pelo menos 3 utilizadores (tem {$users})");
        $props = (int) $pdo->query("SELECT COUNT(*) FROM properties WHERE status='PUBLISHED'")->fetchColumn();
        assert_true($props >= 1, "pelo menos 1 imóvel publicado (tem {$props})");
        $admin = $pdo->query("SELECT role FROM users WHERE email='admin@imoveis.ao'")->fetchColumn();
        assert_eq('ADMIN', $admin, 'admin@imoveis.ao tem role ADMIN');
        $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE email = ?');
        $stmt->execute(['maria@email.ao']);
        $hash = $stmt->fetchColumn();
        assert_true($hash && password_verify('password', $hash), 'login maria@email.ao / password válido');
    } catch (Throwable $e) {
        assert_true(false, 'erro ao ler BD: ' . $e->getMessage());
    }
}

$runHttp = in_array('--http', $argv ?? [], true);
$baseUrl = 'http://127.0.0.1:8080';
foreach ($argv ?? [] as $arg) {
    if (str_starts_with($arg, '--base=')) {
        $baseUrl = rtrim(substr($arg, 7), '/');
    }
}

if ($runHttp) {
    echo "\n▶ Testes HTTP ({$baseUrl})\n";

    function http_get(string $url): array {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_TIMEOUT => 5,
                CURLOPT_HEADER => true,
            ]);
            $raw = curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
            curl_close($ch);
            return [
                'code' => $code,
                'body' => is_string($raw) ? substr($raw, $headerSize) : '',
            ];
        }

        $ctx = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
                'ignore_errors' => true,
                'follow_location' => 1,
            ],
        ]);
        $body = @file_get_contents($url, false, $ctx);
        $code = 0;
        if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
            $code = (int) $m[1];
        }
        return [
            'code' => $code,
            'body' => is_string($body) ? $body : '',
        ];
    }

    $home = http_get($baseUrl . '/');
    assert_eq(200, $home['code'], 'GET / → 200');
    assert_true(str_contains($home['body'], 'Imóveis') || str_contains($home['body'], 'Imoveis'), 'homepage contém marca');

    $login = http_get($baseUrl . '/login.php');
    assert_eq(200, $login['code'], 'GET /login.php → 200');
    assert_true(
        str_contains($login['body'], 'password') || str_contains($login['body'], 'Palavra'),
        'login tem campo password'
    );

    $explorar = http_get($baseUrl . '/explorar.php');
    assert_eq(200, $explorar['code'], 'GET /explorar.php → 200');

    $registo = http_get($baseUrl . '/registo.php');
    assert_eq(200, $registo['code'], 'GET /registo.php → 200');

    $dash = http_get($baseUrl . '/dashboard.php');
    assert_true(in_array($dash['code'], [200, 302, 301], true), 'GET /dashboard.php protegido');
} else {
    echo "\n▶ Testes HTTP\n";
    echo "  ℹ Ignorados. Para activar: php tests/run.php --http\n";
}

echo "\n========================================\n";
echo "  Resultado: {$passed} passou, {$failed} falhou\n";
echo "========================================\n";

if ($failed > 0) {
    echo "\nFalhas:\n";
    foreach ($errors as $e) {
        echo "  - {$e}\n";
    }
    exit(1);
}

echo "\nTodos os testes passaram.\n";
exit(0);
