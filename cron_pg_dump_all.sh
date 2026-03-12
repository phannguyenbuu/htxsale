#!/usr/bin/env bash
set -euo pipefail

TS="$(date +'%y_%m_%d_%H_%M')"
OUT_SQL="/root/backup/postgres_all_${TS}.sql"
OUT_GZ="${OUT_SQL}.gz"

export PGPASSWORD="myPass"
pg_dumpall -U postgres > "$OUT_SQL"
gzip -f "$OUT_SQL"

rclone copyto "$OUT_GZ" "drive:backup/postgres_all_${TS}.sql.gz"
