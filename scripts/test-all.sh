#!/bin/bash

# Скрипт для запуску тестів всіх сервісів
# Використання: ./scripts/test-all.sh

set -e

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Running tests for all services...${NC}\n"

# Лічильники
PASSED=0
FAILED=0
SKIPPED=0

# Функція для запуску тестів
test_service() {
  local service_name=$1
  local service_path=$2

  echo -e "${BLUE}Testing $service_name...${NC}"

  if [ ! -d "$service_path" ]; then
    echo -e "${YELLOW}⊘ Directory not found, skipping${NC}\n"
    ((SKIPPED++))
    return
  fi

  cd "$service_path"

  # Перевірка чи є тести
  if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⊘ No package.json, skipping${NC}\n"
    ((SKIPPED++))
    cd - > /dev/null
    return
  fi

  if ! grep -q '"test":' package.json; then
    echo -e "${YELLOW}⊘ No test script, skipping${NC}\n"
    ((SKIPPED++))
    cd - > /dev/null
    return
  fi

  # Встановлюємо залежності якщо потрібно
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
  fi

  # Запускаємо тести
  if npm test; then
    echo -e "${GREEN}✓ $service_name tests passed${NC}\n"
    ((PASSED++))
  else
    echo -e "${RED}✗ $service_name tests failed${NC}\n"
    ((FAILED++))
  fi

  cd - > /dev/null
}

# Тестуємо всі сервіси
test_service "Auth Service" "services/auth-service"
test_service "Spell Service" "services/spell-api"
test_service "Gateway" "gateway"
test_service "Web" "web"

# Підсумок
echo -e "${BLUE}═══════════════════════════════════${NC}"
echo -e "${BLUE}Test Summary:${NC}"
echo -e "${GREEN}Passed:  $PASSED${NC}"
echo -e "${RED}Failed:  $FAILED${NC}"
echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
echo -e "${BLUE}═══════════════════════════════════${NC}"

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Some tests failed!${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
