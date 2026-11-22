<?php
require_once __DIR__ . '/includes/config.php';
requireLogin();
$user = currentUser();
$pageTitle = 'Painel';
$uid = (int)$user['id'];

$stats = [];
$extra = '';

if ($user['role'] === 'ADMIN') {
    $stats = [
        ['label' => 'Utilizadores', 'value' => db()->query('SELECT COUNT(*) FROM users')->fetchColumn()],
        ['label' => 'Imóveis', 'value' => db()->query('SELECT COUNT(*) FROM properties')->fetchColumn()],
        ['label' => 'Publicados', 'value' => db()->query("SELECT COUNT(*) FROM properties WHERE status='PUBLISHED'")->fetchColumn()],
        ['label' => 'Visitas pendentes', 'value' => db()->query("SELECT COUNT(*) FROM visits WHERE status='PENDING'")->fetchColumn()],
    ];
    $rows = db()->query("SELECT p.*, u.name AS owner_name FROM properties p JOIN users u ON u.id = p.owner_id ORDER BY p.created_at DESC LIMIT 15")->fetchAll();
    $extra = '<h2 style="margin:2rem 0 1rem;font-size:1.15rem">Imóveis recentes</h2><div class="table-wrap"><table><thead><tr><th>Título</th><th>Proprietário</th><th>Preço</th><th>Estado</th><th></th></tr></thead><tbody>';
    foreach ($rows as $r) {
        $extra .= '<tr><td>' . e($r['title']) . '</td><td>' . e($r['owner_name']) . '</td><td>' . formatMoney($r['monthly_price']) . '</td><td><span class="badge">' . e($statusLabels[$r['status']] ?? $r['status']) . '</span></td>';
        if ($r['status'] === 'PENDING_VERIFICATION') {
            $extra .= '<td><a class="btn btn-sm btn-primary" href="admin/aprovar.php?id=' . (int)$r['id'] . '&action=approve">Aprovar</a></td>';
        } else {
            $extra .= '<td></td>';
        }
        $extra .= '</tr>';
    }
    $extra .= '</tbody></table></div>';
} elseif ($user['role'] === 'OWNER') {
    $stats = [
        ['label' => 'Meus imóveis', 'value' => db()->query("SELECT COUNT(*) FROM properties WHERE owner_id=$uid")->fetchColumn()],
        ['label' => 'Publicados', 'value' => db()->query("SELECT COUNT(*) FROM properties WHERE owner_id=$uid AND status='PUBLISHED'")->fetchColumn()],
        ['label' => 'Pendentes', 'value' => db()->query("SELECT COUNT(*) FROM properties WHERE owner_id=$uid AND status='PENDING_VERIFICATION'")->fetchColumn()],
        ['label' => 'Visitas', 'value' => db()->query("SELECT COUNT(*) FROM visits v JOIN properties p ON p.id=v.property_id WHERE p.owner_id=$uid")->fetchColumn()],
    ];
    $stmt = db()->prepare('SELECT * FROM properties WHERE owner_id = ? ORDER BY created_at DESC');
    $stmt->execute([$uid]);
    $rows = $stmt->fetchAll();
    $extra = '<div style="display:flex;justify-content:space-between;align-items:center;margin:2rem 0 1rem"><h2 style="font-size:1.15rem">Meus imóveis</h2><a href="proprietario/novo-imovel.php" class="btn btn-primary btn-sm">+ Adicionar imóvel</a></div>';
    $extra .= '<div class="table-wrap"><table><thead><tr><th>Título</th><th>Preço</th><th>Estado</th><th></th></tr></thead><tbody>';
    foreach ($rows as $r) {
        $extra .= '<tr><td>' . e($r['title']) . '</td><td>' . formatMoney($r['monthly_price']) . '</td><td><span class="badge">' . e($statusLabels[$r['status']] ?? $r['status']) . '</span></td><td><a href="imovel.php?id=' . (int)$r['id'] . '">Ver</a></td></tr>';
    }
    $extra .= '</tbody></table></div>';
} else {
    $stats = [
        ['label' => 'Visitas', 'value' => db()->query("SELECT COUNT(*) FROM visits WHERE client_id=$uid")->fetchColumn()],
        ['label' => 'Pendentes', 'value' => db()->query("SELECT COUNT(*) FROM visits WHERE client_id=$uid AND status='PENDING'")->fetchColumn()],
        ['label' => 'Confirmadas', 'value' => db()->query("SELECT COUNT(*) FROM visits WHERE client_id=$uid AND status='CONFIRMED'")->fetchColumn()],
        ['label' => 'Negociações', 'value' => db()->query("SELECT COUNT(*) FROM negotiations WHERE client_id=$uid")->fetchColumn()],
    ];
    $stmt = db()->prepare('SELECT v.*, p.title FROM visits v JOIN properties p ON p.id = v.property_id WHERE v.client_id = ? ORDER BY v.created_at DESC LIMIT 10');
    $stmt->execute([$uid]);
    $rows = $stmt->fetchAll();
    $vStatus = ['PENDING'=>'Pendente','CONFIRMED'=>'Confirmada','REJECTED'=>'Rejeitada','COMPLETED'=>'Realizada','CANCELLED'=>'Cancelada'];
    $extra = '<h2 style="margin:2rem 0 1rem;font-size:1.15rem">Minhas visitas</h2><div class="table-wrap"><table><thead><tr><th>Imóvel</th><th>Data</th><th>Hora</th><th>Estado</th></tr></thead><tbody>';
    foreach ($rows as $r) {
        $extra .= '<tr><td>' . e($r['title']) . '</td><td>' . e($r['scheduled_date']) . '</td><td>' . e($r['scheduled_time']) . '</td><td><span class="badge">' . e($vStatus[$r['status']] ?? $r['status']) . '</span></td></tr>';
    }
    if (empty($rows)) $extra .= '<tr><td colspan="4" style="text-align:center;color:var(--muted)">Nenhuma visita ainda. <a href="explorar.php">Explorar imóveis</a></td></tr>';
    $extra .= '</tbody></table></div>';
}

require __DIR__ . '/includes/header.php';
?>

<div class="dash-layout">
  <aside class="sidebar">
    <a href="<?= APP_URL ?>/dashboard.php" class="active">Painel</a>
    <a href="<?= APP_URL ?>/explorar.php">Explorar</a>
    <?php if ($user['role'] === 'OWNER'): ?>
      <a href="<?= APP_URL ?>/proprietario/novo-imovel.php">Novo imóvel</a>
    <?php endif; ?>
    <?php if ($user['role'] === 'ADMIN'): ?>
      <a href="<?= APP_URL ?>/admin/aprovar.php">Verificar imóveis</a>
    <?php endif; ?>
    <a href="<?= APP_URL ?>/logout.php">Terminar sessão</a>
  </aside>
  <div class="dash-content">
    <h1 style="font-size:1.4rem;margin-bottom:.25rem">Olá, <?= e(explode(' ', $user['name'])[0]) ?></h1>
    <p style="color:var(--muted);font-size:.9rem;margin-bottom:1.5rem">
      <?= $user['role'] === 'ADMIN' ? 'Administrador' : ($user['role'] === 'OWNER' ? 'Proprietário' : 'Cliente') ?>
    </p>

    <div class="stats">
      <?php foreach ($stats as $s): ?>
        <div class="stat-card">
          <div class="label"><?= e($s['label']) ?></div>
          <div class="value"><?= e((string)$s['value']) ?></div>
        </div>
      <?php endforeach; ?>
    </div>

    <?= $extra ?>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
