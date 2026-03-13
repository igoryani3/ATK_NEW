#!/bin/bash

# ATK Transit — запуск фронтенда и бэкенда

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== ATK Transit ===${NC}"
echo ""

# --- Бэкенд ---
echo -e "${BLUE}[Backend]${NC} Запуск Flask на http://localhost:5555 ..."

# Активация виртуального окружения, если есть
if [ -d "$BACKEND_DIR/venv" ]; then
    source "$BACKEND_DIR/venv/bin/activate"
elif [ -d "$BACKEND_DIR/.venv" ]; then
    source "$BACKEND_DIR/.venv/bin/activate"
fi

cd "$BACKEND_DIR"
python3 app.py &
BACKEND_PID=$!
echo "  PID: $BACKEND_PID"

# --- Фронтенд ---
echo -e "${BLUE}[Frontend]${NC} Запуск Next.js на http://localhost:3000 ..."
cd "$FRONTEND_DIR"
npx next dev &
FRONTEND_PID=$!
echo "  PID: $FRONTEND_PID"

echo ""
echo -e "${GREEN}Оба сервиса запущены!${NC}"
echo "  Backend:  http://localhost:5555"
echo "  Frontend: http://localhost:3000/projects/ATK/"
echo ""
echo -e "${BLUE}⚠️  ВАЖНО:${NC} Приложение настроено для subpath deployment"
echo "  Открывайте: http://localhost:3000/projects/ATK/ (со слэшем в конце)"
echo ""
echo "Для остановки нажмите Ctrl+C"

# Ждём сигнал завершения и останавливаем оба процесса
trap "echo ''; echo 'Остановка...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
