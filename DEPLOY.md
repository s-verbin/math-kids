# Деплой MathKids на sverbin.ru

## Требования

- Доступ по SSH к серверу `151.247.197.131`
- Ключ SSH добавлен в `~/.ssh/known_hosts` или `ssh-agent`
- Домен `sverbin.ru` настроен на IP сервера
- На сервере установлены: `Docker`, `docker compose`, `nginx`, `certbot`

## Быстрый старт

```bash
# По умолчанию
./deploy.sh

# С другим пользователем
SSH_USER=deploy ./deploy.sh

# Вручную
export SERVER_IP=151.247.197.131
export DOMAIN=sverbin.ru
export SSH_USER=root
./deploy.sh
```

## Что делает скрипт

1. Проверяет SSH-доступ и занятые порты на сервере
2. Находит свободные порты для backend и frontend
3. Копирует код на сервер (`rsync`, без `node_modules` и `mathkids.db`)
4. Собирает и запускает Docker-контейнеры
5. Проверяет `/api/health`
6. Добавляет nginx-конфиг для `sverbin.ru`
7. Выпускает/обновляет SSL-сертификат через certbot

## Архитектура

- `backend` — Node.js + Express на `BACKEND_PORT` (по умолчанию 3001)
- `frontend` — статический билд Vite через nginx на `FRONTEND_PORT` (по умолчанию 3000)
- `nginx` на хосте — проксирует `sverbin.ru` → frontend и `sverbin.ru/api/*` → backend
- БД `mathkids.db` хранится в Docker volume `backend-data`

## Проверка после деплоя

- Открыть `https://sverbin.ru`
- Проверить API: `curl https://sverbin.ru/api/health`

## Важно

- Скрипт НЕ трогает другие сайты в `/etc/nginx/sites-enabled/`
- Перед выпуском certbot убедитесь, что DNS `sverbin.ru` указывает на `151.247.197.131`
