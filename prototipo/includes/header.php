<?php
$user = currentUser();
$flash = getFlash();
?>
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($pageTitle ?? APP_NAME) ?> | <?= APP_NAME ?></title>
  <link rel="stylesheet" href="<?= APP_URL ?>/assets/css/style.css">
</head>
<body>
<header class="site-header">
  <div class="container inner">
    <a href="<?= APP_URL ?>/" class="logo">Imóveis<span>Angola</span></a>
    <ul class="nav">
      <li><a href="<?= APP_URL ?>/explorar.php">Explorar</a></li>
      <li><a href="<?= APP_URL ?>/sobre.php">Sobre</a></li>
      <li><a href="<?= APP_URL ?>/contactos.php">Contactos</a></li>
    </ul>
    <div class="header-actions">
      <?php if ($user): ?>
        <a href="<?= APP_URL ?>/dashboard.php" class="btn btn-outline btn-sm"><?= e($user['name']) ?></a>
        <a href="<?= APP_URL ?>/logout.php" class="btn btn-primary btn-sm">Sair</a>
      <?php else: ?>
        <a href="<?= APP_URL ?>/login.php" class="btn btn-outline btn-sm">Entrar</a>
        <a href="<?= APP_URL ?>/registo.php" class="btn btn-primary btn-sm">Criar conta</a>
      <?php endif; ?>
    </div>
  </div>
</header>
<?php if ($flash): ?>
<div class="container" style="margin-top:1rem">
  <div class="alert alert-<?= $flash['type'] === 'error' ? 'error' : 'success' ?>">
    <?= e($flash['message']) ?>
  </div>
</div>
<?php endif; ?>
