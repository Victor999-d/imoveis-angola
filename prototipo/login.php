<?php
require_once __DIR__ . '/includes/config.php';
$pageTitle = 'Entrar';

if (isLoggedIn()) redirect('/dashboard.php');

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!$email || !$password) {
        $error = 'Preencha todos os campos.';
    } else {
        $stmt = db()->prepare('SELECT * FROM users WHERE email = ? AND is_active = 1');
        $stmt->execute([strtolower($email)]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            flash('success', 'Sessão iniciada com sucesso.');
            redirect('/dashboard.php');
        } else {
            $error = 'E-mail ou palavra-passe incorrectos.';
        }
    }
}

require __DIR__ . '/includes/header.php';
?>

<div class="form-card">
  <h1>Iniciar sessão</h1>
  <p class="subtitle">Aceda à sua conta Imóveis Angola</p>

  <?php if ($error): ?>
    <div class="alert alert-error"><?= e($error) ?></div>
  <?php endif; ?>

  <form method="post" action="">
    <div class="form-group">
      <label for="email">E-mail</label>
      <input type="email" id="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>" placeholder="seu@email.com">
    </div>
    <div class="form-group">
      <label for="password">Palavra-passe</label>
      <input type="password" id="password" name="password" required placeholder="••••••••">
    </div>
    <button type="submit" class="btn btn-primary btn-block">Entrar</button>
  </form>

  <p style="text-align:center;margin-top:1.25rem;font-size:.875rem;color:var(--muted)">
    Ainda não tem conta? <a href="<?= APP_URL ?>/registo.php">Criar conta</a>
  </p>

  <div class="alert alert-info" style="margin-top:1.5rem;font-size:.8rem">
    <strong>Contas de demonstração</strong> (password: <code>password</code>)<br>
    Admin: admin@imoveis.ao<br>
    Proprietário: joao@email.ao<br>
    Cliente: maria@email.ao
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
