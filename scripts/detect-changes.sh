#!/bin/bash

# Скрипт для визначення які сервіси змінилися
# Використовується для selective builds

set -e

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Detecting changed services...${NC}"

# Порівнюємо з main якщо не вказано інше
BASE_BRANCH=${1:-main}

# Отримуємо список змінених файлів
if [ -z "$CI" ]; then
  # Локальна розробка - порівнюємо з main
  CHANGED_FILES=$(git diff --name-only $BASE_BRANCH...HEAD)
else
  # CI environment - порівнюємо з base branch
  CHANGED_FILES=$(git diff --name-only origin/$BASE_BRANCH...HEAD)
fi

# Функція для перевірки чи сервіс змінився
service_changed() {
  local service_path=$1
  local service_name=$2

  if echo "$CHANGED_FILES" | grep -q "^$service_path"; then
    echo -e "${GREEN}✓ $service_name changed${NC}"
    return 0
  else
    echo -e "  $service_name not changed"
    return 1
  fi
}

# Перевірка всіх сервісів
CHANGED_SERVICES=""

if service_changed "services/auth-service/" "Auth Service"; then
  CHANGED_SERVICES="$CHANGED_SERVICES auth"
fi

if service_changed "services/spell-api/" "Spell Service"; then
  CHANGED_SERVICES="$CHANGED_SERVICES spell"
fi

if service_changed "gateway/" "Gateway"; then
  CHANGED_SERVICES="$CHANGED_SERVICES gateway"
fi

if service_changed "web/" "Web (Frontend)"; then
  CHANGED_SERVICES="$CHANGED_SERVICES web"
fi

if service_changed "db/" "Database"; then
  CHANGED_SERVICES="$CHANGED_SERVICES db"
fi

if service_changed "infrastructure/" "Infrastructure"; then
  CHANGED_SERVICES="$CHANGED_SERVICES infra"
fi

# Виведення результату
if [ -z "$CHANGED_SERVICES" ]; then
  echo -e "${YELLOW}No service changes detected${NC}"
  exit 0
else
  echo -e "${GREEN}Changed services:${CHANGED_SERVICES}${NC}"

  # Експорт для використання в інших скриптах
  export CHANGED_SERVICES
  echo "CHANGED_SERVICES=$CHANGED_SERVICES" >> $GITHUB_ENV 2>/dev/null || true
fi
