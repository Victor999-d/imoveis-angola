<?php
require_once __DIR__ . '/includes/config.php';
$pageTitle = 'Criar conta';

if (isLoggedIn()) redirect('/dashboard.php');

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    $role = $_POST['role'] ?? 'CLIENT';

    if (!$name || !$email || !$password) {
        $error = 'Preencha os campos obrigatórios.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'E-mail inválido.';
    } elseif (strlen($password) < 6) {
        $error = 'A palavra-passe deve ter pelo menos 6 caracteres.';
    } elseif ($password !== $confirm) {
        $error = 'As palavras-passe não coincidem.';
    } elseif (!in_array($role, ['OWNER', 'CLIENT'], true)) {
        $error = 'Tipo de conta inválido.';
    } else {
        $check = db()->prepare('SELECT id FROM users WHERE email = ?');
        $check->execute([strtolower($email)]);
        if ($check->fetch()) {
            $error = 'Já existe uma conta com este e-mail.';
        } else {
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = db()->prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?,?,?,?,?)');
            $stmt->execute([$name, strtolower($email), $phone ?: null, $hash, $role]);
            $userId = (int) db()->lastInsertId();

            if ($role === 'OWNER') {
                db()->prepare('INSERT INTO owner_profiles (user_id) VALUES (?)')->execute([$userId]);
            } else {
                db()->prepare('INSERT INTO client_profiles (user_id) VALUES (?)')->execute([$userId]);
            }

            flash('success', 'Conta criada com sucesso! Pode iniciar sessão.');
            redirect('/login.php');
        }
    }
}

require __DIR__ . '/includes/header.php';
?>

<div class="form-card">
  <h1>Criar conta</h1>
  <p class="subtitle">Junte-se à plataforma de arrendamento</p>

  <?php if ($error): ?>
    <div class="alert alert-error"><?= e($error) ?></div>
  <?php endif; ?>

  <form method="post" action="">
    <div class="role-picker" style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
      <label class="role-option" style="border:2px solid var(--border);border-radius:10px;padding:1rem;text-align:center;cursor:pointer;font-weight:600">
        <input type="radio" name="role" value="CLIENT" <?= ($_POST['role'] ?? 'CLIENT') === 'CLIENT' ? 'checked' : '' ?>>
        Sou Cliente
      </label>
      <label class="role-option" style="border:2px solid var(--border);border-radius:10px;padding:1rem;text-align:center;cursor:pointer;font-weight:600">
        <input type="radio" name="role" value="OWNER" <?= ($_POST['role'] ?? '') === 'OWNER' ? 'checked' : '' ?>>
        Sou Proprietário
      </label>
    </div>

    <div class="form-group">
      <label for="name">Nome completo</label>
      <input type="text" id="name" name="name" required value="<?= e($_POST['name'] ?? '') ?>">
    </div>
    <div class="form-group">
      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>">
    </div>
    <div class="form-group">
      <label for="phone">Telefone</label>
      <input type="text" id="phone" name="phone" placeholder="+244 9XX XXX XXX" value="<?= e($_POST['phone'] ?? '') ?>">
    </div>
    <div class="form-group">
      <label for="password">Palavra-passe</label>
      <input type="password" id="password" name="password" required minlength="6">
    </div>
    <div class="form-group">
      <label for="confirm_password">Confirmar palavra-passe</label>
      <input type="password" id="confirm_password" name="confirm_password" required>
    </div>
    <button type="submit" class="btn btn-primary btn-block">Criar conta</button>
  </form>

  <p style="text-align:center;margin-top:1.25rem;font-size:.875rem;color:var(--muted)">
    Já tem conta? <a href="<?= APP_URL ?>/login.php">Iniciar sessão</a>
  </p>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
