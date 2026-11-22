<?php
require_once __DIR__ . '/includes/config.php';
$pageTitle = 'Início';

try {
    $stmt = db()->query("SELECT * FROM properties WHERE status = 'PUBLISHED' ORDER BY published_at DESC LIMIT 6");
    $properties = $stmt->fetchAll();
} catch (Exception $e) {
    $properties = [];
}

require __DIR__ . '/includes/header.php';
?>

<section class="hero">
  <div class="container">
    <h1>Encontre o imóvel ideal em Angola</h1>
    <p>Plataforma moderna de arrendamento. Proprietários anunciam. Clientes encontram.</p>
    <form class="search-box" action="<?= APP_URL ?>/explorar.php" method="get">
      <input type="text" name="q" placeholder="Província, município ou bairro...">
      <button type="submit" class="btn btn-primary">Pesquisar</button>
    </form>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">Imóveis em destaque</h2>

    <?php if (empty($properties)): ?>
      <p style="color:var(--muted);text-align:center;padding:2rem">
        Nenhum imóvel publicado. Execute: <code>sqlite3 data/imoveis.db < sql/schema.sqlite.sql</code>
      </p>
    <?php else: ?>
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
              <p class="card-meta"><?= e($p['neighborhood']) ?>, <?= e($p['municipality']) ?></p>
              <p class="card-price"><?= formatMoney($p['monthly_price']) ?> <small>/mês</small></p>
              <p class="card-meta">
                <?= (int)$p['bedrooms'] ?> quartos · <?= (int)$p['bathrooms'] ?> WC
              </p>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>

    <div style="text-align:center;margin-top:2rem">
      <a href="<?= APP_URL ?>/explorar.php" class="btn btn-outline">Ver todos os imóveis</a>
    </div>
  </div>
</section>

<?php require __DIR__ . '/includes/footer.php'; ?>
