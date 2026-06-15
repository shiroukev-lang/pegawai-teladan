#!/bin/bash

# =====================================================
# Database Backup Script
# Aplikasi Pegawai Teladan - Inspektorat Jenderal
# =====================================================

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/tlhp_backup_${TIMESTAMP}.sql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📦 Database Backup Script"
echo "========================="
echo ""

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Check if Docker is running
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Docker containers are not running${NC}"
    echo "Please start the containers with: docker-compose up -d"
    exit 1
fi

echo -e "${YELLOW}⏳ Creating backup...${NC}"

# Create backup
docker-compose exec -T postgres pg_dump -U tlhpuser tlhp_db > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo ""
    echo "📄 File: $BACKUP_FILE"
    echo "📊 Size: $SIZE"
    echo ""
    
    # List recent backups
    echo "Recent backups:"
    ls -lht "$BACKUP_DIR" | head -6
    
    # Clean old backups (keep last 10)
    echo ""
    echo "🧹 Cleaning old backups (keeping last 10)..."
    ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | tail -n +11 | xargs -r rm
    echo -e "${GREEN}✅ Cleanup completed${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi
