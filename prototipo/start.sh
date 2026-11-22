#!/bin/bash
set -e
cd "$(dirname "$0")"

PORT="${PORT:-8080}"
HOST="${HOST:-127.0.0.1}"

mkdir -p data

if [ ! -f data/imoveis.db ]; then
  echo "[*] A criar base de dados SQLite..."
  if [ ! -f sql/schema.sqlite.sql ]; then
    echo "[ERRO] Ficheiro sql/schema.sqlite.sql não encontrado."
    echo "       Faça: git pull"
    exit 1
  fi
  sqlite3 data/imoveis.db < sql/schema.sqlite.sql
  echo "[OK] Base de dados criada."
fi

if ! php -m 2>/dev/null | grep -qi pdo_sqlite; then
  echo "[!] Extensão pdo_sqlite em falta."
  echo "    sudo apt install php-sqlite3"
  exit 1
fi

export APP_URL="http://${HOST}:${PORT}"
echo ""
echo "=========================================="
echo "  Imóveis Angola - Protótipo"
echo "  URL: $APP_URL"
echo "=========================================="
echo "  Contas (password: password)"
echo "  Admin:         admin@imoveis.ao"
echo "  Proprietário:  joao@email.ao"
echo "  Cliente:       maria@email.ao"
echo "=========================================="
echo "  Ctrl+C para parar"
echo ""

php -S "${HOST}:${PORT}" -t .
