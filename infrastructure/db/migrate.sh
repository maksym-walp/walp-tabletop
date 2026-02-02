#!/bin/bash

# Database Migration Script
# Usage: ./migrate.sh [up|down|status|create]

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-${DB_ROOT_PASSWORD}}"
MIGRATIONS_DIR="$(dirname "$0")/migrations"
MIGRATIONS_TABLE="schema_migrations"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# MySQL command wrapper
mysql_exec() {
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$@" 2>/dev/null
}

# Initialize migrations table
init_migrations_table() {
    log_info "Initializing migrations table..."
    mysql_exec <<EOFSQL
CREATE DATABASE IF NOT EXISTS migration_tracker;
USE migration_tracker;
CREATE TABLE IF NOT EXISTS $MIGRATIONS_TABLE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOFSQL
    log_info "Migrations table ready"
}

# Check if migration is applied
is_migration_applied() {
    local version=$1
    local count=$(mysql_exec -D migration_tracker -sN -e "SELECT COUNT(*) FROM $MIGRATIONS_TABLE WHERE version='$version';")
    [ "$count" -gt 0 ]
}

# Apply migration
apply_migration() {
    local file=$1
    local version=$(basename "$file" .sql)
    
    if is_migration_applied "$version"; then
        log_warn "Migration $version already applied, skipping"
        return
    fi
    
    log_info "Applying migration: $version"
    
    # Execute migration
    if mysql_exec < "$file"; then
        # Record migration
        mysql_exec -D migration_tracker -e "INSERT INTO $MIGRATIONS_TABLE (version) VALUES ('$version');"
        log_info "Migration $version applied successfully"
    else
        log_error "Failed to apply migration $version"
        exit 1
    fi
}

# Run all pending migrations
migrate_up() {
    log_info "Running migrations..."
    
    init_migrations_table
    
    local count=0
    for migration_file in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration_file" ]; then
            apply_migration "$migration_file"
            count=$((count + 1))
        fi
    done
    
    if [ $count -eq 0 ]; then
        log_info "No new migrations to apply"
    else
        log_info "Applied $count migration(s)"
    fi
}

# Show migration status
migrate_status() {
    log_info "Migration status:"
    echo ""
    
    init_migrations_table
    
    for migration_file in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration_file" ]; then
            local version=$(basename "$migration_file" .sql)
            if is_migration_applied "$version"; then
                echo -e "  ${GREEN}✓${NC} $version (applied)"
            else
                echo -e "  ${YELLOW}○${NC} $version (pending)"
            fi
        fi
    done
    
    echo ""
}

# Create new migration
migrate_create() {
    local name=$1
    
    if [ -z "$name" ]; then
        log_error "Migration name required"
        echo "Usage: ./migrate.sh create <migration_name>"
        exit 1
    fi
    
    # Get next migration number
    local last_number=0
    for f in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$f" ]; then
            local num=$(basename "$f" | cut -d'_' -f1)
            if [ "$num" -gt "$last_number" ]; then
                last_number=$num
            fi
        fi
    done
    
    local next_number=$(printf "%03d" $((last_number + 1)))
    local filename="${MIGRATIONS_DIR}/${next_number}_${name}.sql"
    
    cat > "$filename" <<EOFTEMPLATE
-- Migration: ${next_number}_${name}
-- Description: 
-- Date: $(date +%Y-%m-%d)

-- Add your SQL here

EOFTEMPLATE
    
    log_info "Created migration: $filename"
}

# Main
case "${1:-up}" in
    up)
        migrate_up
        ;;
    status)
        migrate_status
        ;;
    create)
        migrate_create "$2"
        ;;
    *)
        echo "Usage: $0 {up|status|create <name>}"
        echo ""
        echo "Commands:"
        echo "  up              - Apply all pending migrations"
        echo "  status          - Show migration status"
        echo "  create <name>   - Create a new migration file"
        exit 1
        ;;
esac
