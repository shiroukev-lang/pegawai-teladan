#!/bin/bash

# =====================================================
# Database Restore Script
# Aplikasi Pegawai Teladan - Inspektorat Jenderal
# =====================================================

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "♻️  Database Restore Script"
echo "=========================="
echo ""

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: $0 <backup_file.sql>${NC}"
    echo ""
    echo "Available backups:"
    ls -lht ./backups/*.sql 2>/dev/null | head -5
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Docker containers are not running${NC}"
    echo "Please start the containers with: docker-compose up -d"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will replace all existing data!${NC}"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}⏳ Restoring database...${NC}"

# Drop and recreate database
echo "1. Dropping existing database..."
docker-compose exec -T postgres psql -U tlhpuser -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'tlhp_db';" postgres > /dev/null 2>&1
docker-compose exec -T postgres dropdb -U tlhpuser tlhp_db 2>/dev/null
docker-compose exec -T postgres createdb -U tlhpuser tlhp_db

# Restore from backup
echo "2. Restoring from backup..."
docker-compose exec -T postgres psql -U tlhpuser tlhp_db < "$BACKUP_FILE"

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
    echo ""
    
    # Show statistics
    echo "Database statistics:"
    docker-compose exec -T postgres psql -U tlhpuser tlhp_db -c "
        SELECT 
            'Pegawai' as table_name, COUNT(*) as count FROM pegawai
        UNION ALL
        SELECT 'Kandidat', COUNT(*) FROM kandidat
        UNION ALL
        SELECT 'Vote Phase 1', COUNT(*) FROM vote_phase1
        UNION ALL
        SELECT 'Vote Phase 2', COUNT(*) FROM vote_phase2;
    "
else
    echo -e "${RED}❌ Restore failed${NC}"
    exit 1
fi
