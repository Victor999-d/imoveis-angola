<?php
require_once __DIR__ . '/includes/config.php';

$id = (int)($_GET['id'] ?? 0);
$stmt = db()->prepare("SELECT p.*, u.name AS owner_name FROM properties p JOIN users u ON u.id = p.owner_id WHERE p.id = ?");
$stmt->execute([$id]);
$p = $stmt->fetch();

if (!$p || ($p['status'] !== 'PUBLISHED' && (!isLoggedIn() || (currentUser()['role'] ?? '') === 'CLIENT'))) {
    flash('error', 'Imóvel não encontrado.');
    redirect('/explorar.php');
}

$pageTitle = $p['title'];
$user = currentUser();
$visitError = '';
$visitSuccess = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['solicitar_visita'])) {
    requireLogin();
    if (currentUser()['role'] !== 'CLIENT') {
        $visitError = 'Apenas clientes podem solicitar visitas.';
    } else {
        $date = $_POST['date'] ?? '';
        $time = $_POST['time'] ?? '';
        $msg = trim($_POST['message'] ?? '');
        if (!$date || !$time) {
            $visitError = 'Seleccione data e horário.';
        } else {
            $ins = db()->prepare('INSERT INTO visits (property_id, client_id, scheduled_date, scheduled_time, message) VALUES (?,?,?,?,?)');
            $ins->execute([$id, currentUser()['id'], $date, $time, $msg ?: null]);
            $visitSuccess = 'Solicitação de visita enviada com sucesso.';
        }
    }
}

require __DIR__ . '/includes/header.php';
?>

<section class="section">
  <div class="container">
    <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:2rem">
      <div>
        <?php if (!empty($p['image_url'])): ?>
          <img src="<?= e($p['image_url']) ?>" alt="<?= e($p['title']) ?>" style="width:100%;border-radius:12px;aspect-ratio:16/10;object-fit:cover">
        <?php else: ?>
          <div style="width:100%;aspect-ratio:16/10;background:#edf2f7;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--muted)">Sem fotografia</div>
        <?php endif; ?>
      </div>
      <div>
        <span class="badge"><?= e($typeLabels[$p['type']] ?? $p['type']) ?></span>
        <h1 style="font-size:1.6rem;margin:.5rem 0"><?= e($p['title']) ?></h1>
        <p class="card-meta"><?= e($p['address']) ?> · <?= e($p['neighborhood']) ?>, <?= e($p['municipality']) ?></p>
        <p class="card-price" style="font-size:1.5rem;margin:1rem 0"><?= formatMoney($p['monthly_price']) ?> <small>/mês</small></p>
        <p style="color:var(--muted);font-size:.9rem;margin:1rem 0">
          <?= (int)$p['bedrooms'] ?> quartos · <?= (int)$p['bathrooms'] ?> WC
          <?php if ($p['area_sqm']): ?> · <?= e($p['area_sqm']) ?> m²<?php endif; ?>
          · <?= !empty($p['is_furnished']) ? 'Mobilado' : 'Não mobilado' ?>
        </p>
        <p style="margin:1.25rem 0;color:var(--muted);line-height:1.6"><?= nl2br(e($p['description'])) ?></p>
        <p style="font-size:.85rem;color:var(--muted)">Anunciado por: <?= e($p['owner_name']) ?></p>

        <?php if ($visitSuccess): ?>
          <div class="alert alert-success" style="margin-top:1rem"><?= e($visitSuccess) ?></div>
        <?php endif; ?>
        <?php if ($visitError): ?>
          <div class="alert alert-error" style="margin-top:1rem"><?= e($visitError) ?></div>
        <?php endif; ?>

        <?php if ($user && $user['role'] === 'CLIENT'): ?>
          <form method="post" style="margin-top:1.5rem;background:var(--bg);padding:1.25rem;border-radius:12px;border:1px solid var(--border)">
            <h3 style="font-size:1rem;margin-bottom:1rem">Solicitar visita</h3>
            <div class="form-group">
              <label>Data</label>
              <input type="date" name="date" required min="<?= date('Y-m-d', strtotime('+1 day')) ?>">
            </div>
            <div class="form-group">
              <label>Horário</label>
              <select name="time" required>
                <option value="">Seleccione</option>
                <?php foreach (['09:00','10:00','11:00','14:00','15:00','16:00','17:00'] as $t): ?>
                  <option value="<?= $t ?>"><?= $t ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="form-group">
              <label>Mensagem (opcional)</label>
              <textarea name="message" rows="2"></textarea>
            </div>
            <button type="submit" name="solicitar_visita" value="1" class="btn btn-primary btn-block">Enviar solicitação</button>
          </form>
        <?php elseif (!$user): ?>
          <p style="margin-top:1.5rem">
            <a href="<?= APP_URL ?>/login.php" class="btn btn-primary">Entrar para solicitar visita</a>
          </p>
        <?php endif; ?>
      </div>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
