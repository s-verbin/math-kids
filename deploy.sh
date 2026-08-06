#!/bin/bash
set -e

# ==== Конфигурация ====
SERVER_IP="${SERVER_IP:-151.247.197.131}"
DOMAIN="${DOMAIN:-sverbin.ru}"
SSH_USER="${SSH_USER:-root}"
SSH_HOST="${SSH_USER}@${SERVER_IP}"
REMOTE_DIR="${REMOTE_DIR:-/opt/math-kids}"
BACKEND_PORT_DEFAULT=3001
FRONTEND_PORT_DEFAULT=3000

# ==== Проверка зависимостей ====
for cmd in ssh rsync; do
  if ! command -v "$cmd" &> /dev/null; then
    echo "❌ Не найдена утилита: $cmd"
    exit 1
  fi
done

echo "🚀 Деплой MathKids на ${SSH_HOST}"
echo "📦 Домен: ${DOMAIN}"

# ==== Подготовка сервера ====
echo "🧹 Создаём директорию на сервере..."
ssh "$SSH_HOST" "mkdir -p ${REMOTE_DIR}"

# ==== Копирование кода ====
echo "📂 Копируем проект на сервер..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='mathkids.db' \
  --exclude='dist' \
  --exclude='*.log' \
  ./ "$SSH_HOST:${REMOTE_DIR}/"

# ==== Останавливаем старые контейнеры, чтобы освободить порты ====
echo "🛑 Останавливаем старые контейнеры..."
ssh "$SSH_HOST" "cd ${REMOTE_DIR} && docker compose down 2>/dev/null || true"

# ==== Проверка занятых портов ====
echo "🔍 Проверяем доступные порты на сервере..."
USED_PORTS=$(ssh "$SSH_HOST" "ss -tlnp | awk 'NR>1 {for(i=4;i<=NF;i++) print \$i}' | grep -oP ':\K[0-9]+' | sort -u" || true)

echo "📋 Используемые порты: ${USED_PORTS:-'не определены'}"

TAKEN_PORTS=""

find_free_port() {
  local port=$1
  while [ "$port" -lt 65535 ]; do
    if ! echo "$USED_PORTS $TAKEN_PORTS" | grep -q "^${port}$"; then
      TAKEN_PORTS="$TAKEN_PORTS $port"
      echo "$port"
      return
    fi
    port=$((port + 1))
  done
  echo "❌ Нет свободных портов"
  exit 1
}

BACKEND_PORT=$(find_free_port "$BACKEND_PORT_DEFAULT")
FRONTEND_PORT=$(find_free_port "$FRONTEND_PORT_DEFAULT")

echo "✅ Backend порт: ${BACKEND_PORT}"
echo "✅ Frontend порт: ${FRONTEND_PORT}"

# ==== Настройка окружения ====
echo "⚙️ Создаём .env файл..."

# Сохраняем существующий JWT_SECRET или генерируем новый
EXISTING_JWT=$(ssh "$SSH_HOST" "grep '^JWT_SECRET=' ${REMOTE_DIR}/.env 2>/dev/null | cut -d= -f2" || true)
JWT_SECRET=${EXISTING_JWT:-$(openssl rand -hex 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 64)}

ssh "$SSH_HOST" "cat > ${REMOTE_DIR}/.env <<EOF
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
DOMAIN=${DOMAIN}
JWT_SECRET=${JWT_SECRET}
EOF"

# ==== Сборка и запуск Docker ====
echo "🐳 Собираем и запускаем контейнеры..."
ssh "$SSH_HOST" "cd ${REMOTE_DIR} && docker compose up -d --build"

# ==== Проверка запуска ====
echo "⏳ Ожидаем запуск backend..."
for i in {1..30}; do
  if ssh "$SSH_HOST" "curl -sf http://localhost:${BACKEND_PORT}/api/health" &> /dev/null; then
    echo "✅ Backend доступен"
    break
  fi
  sleep 1
done

# ==== Настройка Nginx ====
echo "🌐 Настраиваем nginx..."
ssh "$SSH_HOST" << REMOTE_SCRIPT
  set -e
  
  # Проверяем, что nginx установлен
  if ! command -v nginx &> /dev/null; then
    echo "❌ Nginx не установлен на сервере. Установите его вручную."
    exit 1
  fi

  # Проверяем, что другие сайты не пострадают
  if [ -f /etc/nginx/sites-enabled/${DOMAIN} ]; then
    echo "📝 Конфиг для ${DOMAIN} уже существует, обновляем..."
  fi

  # Генерируем конфиг из шаблона
  mkdir -p /etc/nginx/sites-available
  sed \
    -e "s|__DOMAIN__|${DOMAIN}|g" \
    -e "s|__BACKEND_PORT__|${BACKEND_PORT}|g" \
    -e "s|__FRONTEND_PORT__|${FRONTEND_PORT}|g" \
    "${REMOTE_DIR}/deploy/nginx-site.conf" > "/etc/nginx/sites-available/${DOMAIN}"

  # Создаём симлинк в sites-enabled
  rm -f "/etc/nginx/sites-enabled/${DOMAIN}"
  ln -s "/etc/nginx/sites-available/${DOMAIN}" "/etc/nginx/sites-enabled/${DOMAIN}"

  # Проверяем конфигурацию
  nginx -t

  # Перезагружаем nginx (graceful)
  systemctl reload nginx || nginx -s reload
REMOTE_SCRIPT

# ==== SSL сертификаты ====
echo "🔒 Настраиваем SSL..."
ssh "$SSH_HOST" << REMOTE_SCRIPT
  set -e
  
  if ! command -v certbot &> /dev/null; then
    echo "⚠️ Certbot не найден. SSL не настроен. Установите certbot позже."
    exit 0
  fi

  echo "🔒 Обновляем/выпускаем сертификат только для ${DOMAIN}..."
  certbot certonly --nginx \
    -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --non-interactive --agree-tos \
    --email "admin@${DOMAIN}" \
    --keep-until-expiring \
    --expand

  # Перезагружаем nginx ещё раз
  systemctl reload nginx || nginx -s reload
REMOTE_SCRIPT

# ==== Финал ====
echo ""
echo "✅ Деплой завершён!"
echo "🌐 Сайт: https://${DOMAIN}"
echo "📡 API: https://${DOMAIN}/api"
echo ""
echo "⚠️ Проверьте DNS-записи: ${DOMAIN} → ${SERVER_IP}"
