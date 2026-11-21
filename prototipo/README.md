# Imóveis Angola – Protótipo HTML/CSS/JS/PHP/SQL

Protótipo funcional clássico (LAMP) para análise da estrutura e fluxo da plataforma.

## Requisitos

- PHP 8+
- MySQL / MariaDB
- Apache ou Nginx

## Instalação rápida

```bash
mysql -u root -p < sql/schema.sql
```

Ajuste `includes/config.php` (DB e APP_URL).

Coloque a pasta no servidor web e abra no browser.

## Contas de demonstração

| Perfil | E-mail | Password |
|--------|--------|----------|
| Admin | admin@imoveis.ao | password |
| Proprietário | joao@email.ao | password |
| Cliente | maria@email.ao | password |

## O que está incluído

- Homepage com imóveis em destaque
- Explorar com filtros
- Detalhe do imóvel + solicitar visita
- Login / Registo
- Dashboard por perfil
- Proprietário: cadastrar imóvel
- Admin: aprovar / rejeitar
- SQL com dados de exemplo

## Estrutura

```
prototipo/
├── index.php, login.php, registo.php
├── explorar.php, imovel.php, dashboard.php
├── admin/aprovar.php
├── proprietario/novo-imovel.php
├── includes/
├── assets/css/style.css
├── assets/js/app.js
└── sql/schema.sql
```
