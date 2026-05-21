#!/bin/bash
# ============================================================
# MySQL 自动备份脚本
# 保留30天备份，每天自动执行
# ============================================================

set -e

# 配置
BACKUP_DIR="/backups"
DB_HOST="${MYSQL_HOST:-mysql}"
DB_USER="${MYSQL_USER:-anqing}"
DB_PASS="${MYSQL_PASSWORD:-Anqing@2026}"
DB_NAME="${MYSQL_DATABASE:-anqing_card}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份文件名
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

# 执行备份
echo "[$(date)] 开始备份数据库 $DB_NAME..."
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --databases "$DB_NAME" > "$BACKUP_FILE"

# 压缩备份
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# 检查备份是否成功
if [ -f "$BACKUP_FILE" ]; then
    FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "[$(date)] 备份完成: $BACKUP_FILE ($FILESIZE)"
else
    echo "[$(date)] 备份失败！"
    exit 1
fi

# 删除过期备份
echo "[$(date)] 清理${RETENTION_DAYS}天前的备份..."
DELETED=$(find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "[$(date)] 已删除 $DELETED 个过期备份文件"

# 显示当前备份列表
echo "[$(date)] 当前备份文件:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

echo "[$(date)] 备份任务完成"
