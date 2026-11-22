<?php
require_once __DIR__ . '/includes/config.php';
$pageTitle = 'Explorar Imóveis';

$q = trim($_GET['q'] ?? '');
$provincia = trim($_GET['provincia'] ?? '');
$tipo = trim($_GET['tipo'] ?? '');
$precoMax = trim($_GET['preco_max'] ?? '');

$sql = "SELECT * FROM properties WHERE status = 'PUBLISHED'";
$params = [];

if ($q) {
    $sql .= " AND (title LIKE ? OR neighborhood LIKE ? OR municipality LIKE ?)";
    $like = '%' . $q . '%';
    $params = array_merge($params, [$like, $like, $like]);
}
if ($provincia) {
    $sql .= " AND province = ?";
    $params[] = $provincia;
}
if ($tipo) {
    $sql .= " AND type = ?";
    $params[] = $tipo;
}
if ($precoMax !== '' && is_numeric($precoMax)) {
    $sql .= " AND monthly_price <= ?";
    $params[] = (float)$precoMax;
}

$sql .= " ORDER BY published_at DESC LIMIT 50";

try {
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    $properties = $stmt->fetchAll();
} catch (Exception $e) {
    $properties = [];
}

$provinces = ['Luanda','Benguela','Huambo','Huíla','Cabinda','Namibe','Uíge','Malanje'];

require __DIR__ . '/includes/header.php';
?>

<section class="section">
  <div class="container">
    <h1 class="section-title">Explorar Imóveis</h1>

    <form class="filters" method="get" action="">
      <input type="text" name="q" placeholder="Pesquisar..." value="<?= e($q) ?>" style="flex:1;min-width:160px">
      <select name="provincia">
        <option value="">Todas as províncias</option>
        <?php foreach ($provinces as $p): ?>
          <option value="<?= e($p) ?>" <?= $provincia === $p ? 'selected' : '' ?>><?= e($p) ?></option>
        <?php endforeach; ?>
      </select>
      <select name="tipo">
        <option value="">Todos os tipos</option>
        <?php foreach ($typeLabels as $k => $v): ?>
          <option value="<?= e($k) ?>" <?= $tipo === $k ? 'selected' : '' ?>><?= e($v) ?></option>
        <?php endforeach; ?>
      </select>
      <input type="number" name="preco_max" placeholder="Preço máx. Kz" value="<?= e($precoMax) ?>" style="width:140px">
      <button type="submit" class="btn btn-primary btn-sm">Filtrar</button>
    </form>

    <?php if (empty($properties)): ?>
      <p style="text-align:center;color:var(--muted);padding:3rem 0">Nenhum imóvel encontrado.</p>
    <?php else: ?>
      <p style="color:var(--muted);font-size:.875rem;margin-bottom:1rem"><?= count($properties) ?> imóvel(is)</p>
      <div class="grid-3">
        <?php foreach ($properties as $p): ?>
          <a href="<?= APP_URL ?>/imovel.php?id=<?= (int)$p['id'] ?>" class="card" style="color:inherit;text-decoration:none">
            <?php if (!empty($p['image_url'])): ?>
              <img class="card-img" src="<?= e($p['image_url']) ?>" alt="<?= e($p['title']) ?>">
            <?php else: ?>
              <div class="card-img-placeholder">Sem fotografia</div>
            <?php endif; ?>
            <div class="card-body">
              <span class="badge"><?= e($typeLabels[$p['type']] ?? $p['type']) ?></span>
              <h3 style="margin-top:.5rem"><?= e($p['title']) ?></h3>
              <p class="card-meta"><?= e($p['neighborhood']) ?>, <?= e($p['municipality']) ?> · <?= e($p['province']) ?></p>
              <p class="card-price"><?= formatMoney($p['monthly_price']) ?> <small>/mês</small></p>
              <p class="card-meta">
                <?= (int)$p['bedrooms'] ?> quartos · <?= (int)$p['bathrooms'] ?> WC
              </p>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
