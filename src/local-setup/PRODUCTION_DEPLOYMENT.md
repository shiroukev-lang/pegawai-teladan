# 🚀 Production Deployment Guide

Panduan lengkap untuk deploy Aplikasi Pegawai Teladan ke production environment.

## 📋 Prerequisites

- Server Ubuntu 20.04 LTS atau lebih baru
- Docker & Docker Compose installed
- Domain name dengan DNS configured
- SSL certificate (Let's Encrypt recommended)
- Minimal server specs:
  - CPU: 2 cores
  - RAM: 4GB
  - Storage: 20GB SSD

## 🔐 Security Checklist

Sebelum deployment, pastikan:

- [ ] Password database telah diganti dari default
- [ ] Environment variables menggunakan nilai production
- [ ] SSL/TLS certificate sudah di-setup
- [ ] Firewall dikonfigurasi dengan benar
- [ ] Backup strategy sudah disiapkan
- [ ] Monitoring tools sudah di-setup
- [ ] Rate limiting sudah dikonfigurasi

## 📦 Deployment Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install certbot for SSL
sudo apt install certbot -y
```

### 2. Project Setup

```bash
# Clone atau copy project
git clone <repository-url>
cd aplikasi-pegawai-teladan/local-setup

# Atau upload via SCP
scp -r local-setup user@server:/path/to/project/
```

### 3. Environment Configuration

```bash
# Copy production environment template
cp .env.prod.example .env.prod

# Edit with production values
nano .env.prod
```

**Important**: Ubah nilai berikut di `.env.prod`:

```env
# Database - GANTI PASSWORD!
DB_USER=tlhpuser
DB_PASSWORD=YourStrongPasswordHere123!
DB_NAME=tlhp_db

# API Configuration
API_PORT=3001

# CORS - Tambahkan domain production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Data path
DATA_PATH=/var/lib/tlhp-data
```

### 4. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)

```bash
# Dapatkan SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificate ke nginx folder
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
sudo chmod 644 nginx/ssl/*

# Setup auto-renewal
sudo crontab -e
# Tambahkan:
0 0 1 * * certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
```

#### Option B: Custom Certificate

```bash
# Copy your certificate files
cp your-fullchain.pem nginx/ssl/fullchain.pem
cp your-privkey.pem nginx/ssl/privkey.pem
chmod 644 nginx/ssl/*
```

### 5. Nginx Configuration

Edit `nginx/nginx.conf` dan ganti:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

Dengan domain production Anda.

### 6. Create Data Directory

```bash
# Create persistent data directory
sudo mkdir -p /var/lib/tlhp-data
sudo chown -R $USER:$USER /var/lib/tlhp-data

# Create backup directory
mkdir -p backups
mkdir -p logs
```

### 7. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP & HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### 8. Deploy Application

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Wait for services to be healthy
docker-compose -f docker-compose.prod.yml ps
```

### 9. Initialize Database

```bash
# Initialize application
curl -X POST https://yourdomain.com/api/initialize

# Verify health
curl https://yourdomain.com/health
```

### 10. Verify Deployment

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Check API health
curl https://yourdomain.com/health

# Check database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U tlhpuser -d tlhp_db -c "SELECT COUNT(*) FROM app_config;"

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs --tail=100
```

## 🔄 Backup Strategy

### Automated Daily Backup

Create cron job untuk backup otomatis:

```bash
# Edit crontab
crontab -e

# Tambahkan (backup setiap hari jam 2 pagi)
0 2 * * * cd /path/to/local-setup && ./scripts/backup.sh >> logs/backup.log 2>&1
```

### Manual Backup

```bash
# Backup database
./scripts/backup.sh

# Backup akan tersimpan di folder backups/
ls -lh backups/
```

### Backup ke Remote Storage

```bash
# Upload ke remote storage (contoh: AWS S3)
aws s3 sync backups/ s3://your-bucket/tlhp-backups/ --delete

# Atau menggunakan rsync ke server lain
rsync -avz backups/ user@backup-server:/backup/tlhp/
```

## 📊 Monitoring

### 1. Setup Monitoring Script

Create file `monitor.sh`:

```bash
#!/bin/bash

# Check API health
if ! curl -f https://yourdomain.com/health > /dev/null 2>&1; then
    echo "API DOWN!" | mail -s "TLHP Alert" admin@yourdomain.com
fi

# Check database
if ! docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U tlhpuser > /dev/null 2>&1; then
    echo "Database DOWN!" | mail -s "TLHP Alert" admin@yourdomain.com
fi

# Check disk space
DISK_USAGE=$(df -h /var/lib/tlhp-data | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage: ${DISK_USAGE}%" | mail -s "TLHP Disk Alert" admin@yourdomain.com
fi
```

Add to crontab (setiap 5 menit):

```bash
*/5 * * * * /path/to/monitor.sh
```

### 2. Log Monitoring

```bash
# View recent logs
docker-compose -f docker-compose.prod.yml logs --tail=100 -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs api --tail=100
docker-compose -f docker-compose.prod.yml logs postgres --tail=100

# Log rotation (already configured in docker-compose.prod.yml)
# max-size: 10m, max-file: 3
```

### 3. Resource Monitoring

```bash
# Monitor container resources
docker stats

# Monitor database performance
docker-compose -f docker-compose.prod.yml exec postgres psql -U tlhpuser -d tlhp_db -c "SELECT * FROM pg_stat_activity;"
```

## 🔧 Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker-compose -f docker-compose.prod.yml build --no-cache

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Database Maintenance

```bash
# Vacuum database
docker-compose -f docker-compose.prod.yml exec postgres psql -U tlhpuser -d tlhp_db -c "VACUUM ANALYZE;"

# Reindex
docker-compose -f docker-compose.prod.yml exec postgres psql -U tlhpuser -d tlhp_db -c "REINDEX DATABASE tlhp_db;"

# Check database size
docker-compose -f docker-compose.prod.yml exec postgres psql -U tlhpuser -d tlhp_db -c "SELECT pg_size_pretty(pg_database_size('tlhp_db'));"
```

### Clean Old Logs

```bash
# Clean Docker logs
docker system prune -f

# Clean old backups (keep last 30 days)
find backups/ -name "*.sql" -mtime +30 -delete
```

## 🆘 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart specific service
docker-compose -f docker-compose.prod.yml restart api
```

### Database Connection Issues

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U tlhpuser

# Check connection from API container
docker-compose -f docker-compose.prod.yml exec api curl postgres:5432

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### SSL Certificate Issues

```bash
# Verify certificate
openssl x509 -in nginx/ssl/fullchain.pem -noout -text

# Test SSL
curl -vI https://yourdomain.com

# Renew certificate manually
sudo certbot renew
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Restart containers
docker-compose -f docker-compose.prod.yml restart

# Adjust NODE_OPTIONS in .env.prod if needed
NODE_OPTIONS=--max-old-space-size=1024
```

## 📈 Scaling

### Horizontal Scaling (Multiple API Instances)

Edit `docker-compose.prod.yml`:

```yaml
api:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

Update Nginx upstream:

```nginx
upstream api_backend {
    least_conn;
    server api_1:3001;
    server api_2:3001;
    server api_3:3001;
}
```

### Database Scaling

Consider:
- Read replicas untuk read-heavy workloads
- Connection pooling (sudah di-implement di API server)
- Database sharding jika data sangat besar

## 🔄 Disaster Recovery

### Complete System Restore

```bash
# 1. Setup fresh server (steps 1-7)

# 2. Restore database backup
./scripts/restore.sh backups/latest_backup.sql

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
curl https://yourdomain.com/health
```

### Data Migration

```bash
# Export from old server
pg_dump -U tlhpuser tlhp_db > migration.sql

# Transfer to new server
scp migration.sql user@newserver:/path/to/local-setup/backups/

# Import to new server
./scripts/restore.sh backups/migration.sql
```

## 📞 Support & Contact

**Technical Support**:
- Email: support@inspektorat.go.id
- Documentation: Check README.md files

**Emergency Contact**:
- Database Admin: dba@inspektorat.go.id
- System Admin: sysadmin@inspektorat.go.id

---

**Created**: 18 Desember 2024  
**Version**: 1.0.0  
**Last Updated**: 18 Desember 2024
