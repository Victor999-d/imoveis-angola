<?php
require_once __DIR__ . '/../includes/config.php';
requireRole('OWNER', 'ADMIN');
$pageTitle = 'Novo imóvel';
$user = currentUser();
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $type = $_POST['type'] ?? 'APARTMENT';
    $province = trim($_POST['province'] ?? '');
    $municipality = trim($_POST['municipality'] ?? '');
    $neighborhood = trim($_POST['neighborhood'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $price = (float)($_POST['monthly_price'] ?? 0);
    $bedrooms = (int)($_POST['bedrooms'] ?? 0);
    $bathrooms = (int)($_POST['bathrooms'] ?? 0);
    $area = $_POST['area_sqm'] !== '' ? (float)$_POST['area_sqm'] : null;
    $furnished = isset($_POST['is_furnished']) ? 1 : 0;

    if (!$title || !$description || !$province || !$municipality || !$neighborhood || !$address || $price <= 0) {
        $error = 'Preencha todos os campos obrigatórios.';
    } else {
        $slug = slugify($title) . '-' . time();
        $stmt = db()->prepare('INSERT INTO properties (owner_id, title, slug, description, type, status, province, municipality, neighborhood, address, monthly_price, bedrooms, bathrooms, area_sqm, is_furnished) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([
            $user['id'], $title, $slug, $description, $type, 'PENDING_VERIFICATION',
            $province, $municipality, $neighborhood, $address, $price, $bedrooms, $bathrooms, $area, $furnished
        ]);
        flash('success', 'Imóvel submetido para verificação.');
        redirect('/dashboard.php');
    }
}

require __DIR__ . '/../includes/header.php';
?>
<section class="section">
  <div class="container" style="max-width:640px">
    <h1 class="section-title">Adicionar imóvel</h1>
    <?php if ($error): ?><div class="alert alert-error"><?= e($error) ?></div><?php endif; ?>
    <form method="post" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:1.5rem">
      <div class="form-group"><label>Título *</label><input type="text" name="title" required value="<?= e($_POST['title'] ?? '') ?>"></div>
      <div class="form-group"><label>Descrição *</label><textarea name="description" rows="4" required><?= e($_POST['description'] ?? '') ?></textarea></div>
      <div class="form-group"><label>Tipo</label>
        <select name="type">
          <?php foreach ($typeLabels as $k=>$v): ?><option value="<?= $k ?>"><?= e($v) ?></option><?php endforeach; ?>
        </select>
      </div>
      <div class="form-group"><label>Província *</label><input type="text" name="province" required value="<?= e($_POST['province'] ?? 'Luanda') ?>"></div>
      <div class="form-group"><label>Município *</label><input type="text" name="municipality" required value="<?= e($_POST['municipality'] ?? '') ?>"></div>
      <div class="form-group"><label>Bairro *</label><input type="text" name="neighborhood" required value="<?= e($_POST['neighborhood'] ?? '') ?>"></div>
      <div class="form-group"><label>Endereço *</label><input type="text" name="address" required value="<?= e($_POST['address'] ?? '') ?>"></div>
      <div class="form-group"><label>Preço mensal (Kz) *</label><input type="number" name="monthly_price" required min="1000" value="<?= e($_POST['monthly_price'] ?? '') ?>"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem">
        <div class="form-group"><label>Quartos</label><input type="number" name="bedrooms" min="0" value="<?= e($_POST['bedrooms'] ?? '0') ?>"></div>
        <div class="form-group"><label>WC</label><input type="number" name="bathrooms" min="0" value="<?= e($_POST['bathrooms'] ?? '0') ?>"></div>
        <div class="form-group"><label>Área (m²)</label><input type="number" name="area_sqm" step="0.01" value="<?= e($_POST['area_sqm'] ?? '') ?>"></div>
      </div>
      <div class="form-group"><label><input type="checkbox" name="is_furnished" value="1"> Imóvel mobilado</label></div>
      <button type="submit" class="btn btn-primary btn-block">Submeter para verificação</button>
    </form>
  </div>
</section>
<?php require __DIR__ . '/../includes/footer.php'; ?>
