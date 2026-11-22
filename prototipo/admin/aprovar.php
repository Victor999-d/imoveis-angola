<?php
require_once __DIR__ . '/../includes/config.php';
requireRole('ADMIN');
$pageTitle = 'Verificar imóveis';

if (isset($_GET['id']) && isset($_GET['action'])) {
    $id = (int)$_GET['id'];
    $action = $_GET['action'];
    if ($action === 'approve') {
        db()->prepare("UPDATE properties SET status='PUBLISHED', published_at=datetime('now') WHERE id=?")->execute([$id]);
        flash('success', 'Imóvel aprovado e publicado.');
    } elseif ($action === 'reject') {
        db()->prepare("UPDATE properties SET status='REJECTED' WHERE id=?")->execute([$id]);
        flash('success', 'Imóvel rejeitado.');
    }
    redirect('/admin/aprovar.php');
}

$stmt = db()->query("SELECT p.*, u.name AS owner_name, u.email AS owner_email FROM properties p JOIN users u ON u.id=p.owner_id WHERE p.status='PENDING_VERIFICATION' ORDER BY p.created_at ASC");
$pending = $stmt->fetchAll();

require __DIR__ . '/../includes/header.php';
?>
<section class="section">
  <div class="container">
    <h1 class="section-title">Imóveis pendentes de verificação</h1>
    <?php if (empty($pending)): ?>
      <p style="color:var(--muted)">Não há imóveis pendentes.</p>
      <a href="<?= APP_URL ?>/dashboard.php" class="btn btn-outline" style="margin-top:1rem">Voltar ao painel</a>
    <?php else: ?>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Título</th><th>Proprietário</th><th>Local</th><th>Preço</th><th>Acções</th></tr>
          </thead>
          <tbody>
            <?php foreach ($pending as $p): ?>
              <tr>
                <td><?= e($p['title']) ?></td>
                <td><?= e($p['owner_name']) ?><br><small style="color:var(--muted)"><?= e($p['owner_email']) ?></small></td>
                <td><?= e($p['neighborhood']) ?>, <?= e($p['municipality']) ?></td>
                <td><?= formatMoney($p['monthly_price']) ?></td>
                <td style="white-space:nowrap">
                  <a class="btn btn-sm btn-primary" href="?id=<?= (int)$p['id'] ?>&action=approve">Aprovar</a>
                  <a class="btn btn-sm btn-outline" href="?id=<?= (int)$p['id'] ?>&action=reject">Rejeitar</a>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</section>
<?php require __DIR__ . '/../includes/footer.php'; ?>
