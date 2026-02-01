#!/bin/bash

# Скрипт для збірки тільки змінених сервісів
# Використання: ./scripts/build-changed.sh [base-branch]

set -e

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏗️  Building changed services...${NC}\n"

# Визначаємо які сервіси змінилися
source ./scripts/detect-changes.sh $1

if [ -z "$CHANGED_SERVICES" ]; then
  echo -e "${YELLOW}No services to build${NC}"
  exit 0
fi

# Функція для збірки сервісу
build_service() {
  local service_name=$1
  local service_path=$2

  echo -e "${BLUE}Building $service_name...${NC}"

  if [ -d "$service_path" ]; then
    cd "$service_path"

    # Встановлюємо залежності якщо потрібно
    if [ -f "package.json" ]; then
      if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm ci
      fi

      # Запускаємо build якщо є
      if grep -q '"build":' package.json; then
        npm run build
      fi
    fi

    cd - > /dev/null
    echo -e "${GREEN}✓ $service_name built successfully${NC}\n"
  else
    echo -e "${RED}✗ Directory $service_path not found${NC}\n"
    exit 1
  fi
}

# Збираємо кожен змінений сервіс
for service in $CHANGED_SERVICES; do
  case $service in
    auth)
      build_service "Auth Service" "services/auth-service"
      ;;
    spell)
      build_service "Spell Service" "services/spell-api"
      ;;
    gateway)
      build_service "Gateway" "gateway"
      ;;
    web)
      build_service "Web" "web"
      ;;
    *)
      echo -e "${YELLOW}Skipping $service (no build needed)${NC}"
      ;;
  esac
done

echo -e "${GREEN}✓ All changed services built successfully!${NC}"
