#!/usr/bin/env bash
set -euo pipefail

# Seed sale users into the existing "user" table (role='user').
# Login usernames are ASCII/no-accent as requested.
#
# Optional env:
#   SALE_DEFAULT_PASSWORD (default: 123456)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SALE_DEFAULT_PASSWORD="${SALE_DEFAULT_PASSWORD:-123456}"
export SALE_DEFAULT_PASSWORD

python - <<'PY'
import os
from werkzeug.security import generate_password_hash
from app import app, db, User

default_password = os.getenv("SALE_DEFAULT_PASSWORD", "123456")

# NOTE: "LÀI" appears twice in the request, so we seed two distinct usernames.
sales = [
    ("chi", "CHI"),
    ("giang", "GIANG"),
    ("truc", "TRUC"),
    ("an", "ÂN"),
    ("lai", "LÀI"),
    ("dung", "DŨNG"),
    ("thao", "THẢO"),
    ("quyen", "QUYÊN"),
    ("tien", "TIẾN"),
    ("lai2", "LÀI"),
    ("oanh", "OANH"),
    ("tranglon", "TRANG LỚN"),
    ("trangnho", "TRANG NHỎ"),
]

created = 0
updated = 0

with app.app_context():
    for username, full_name in sales:
        user = User.query.filter_by(username=username).first()
        if user:
            changed = False
            if user.role != "user":
                user.role = "user"
                changed = True
            if user.full_name != full_name:
                user.full_name = full_name
                changed = True
            if changed:
                updated += 1
        else:
            db.session.add(
                User(
                    username=username,
                    password_hash=generate_password_hash(default_password),
                    role="user",
                    full_name=full_name,
                )
            )
            created += 1

    db.session.commit()

print(f"Seed completed. created={created}, updated={updated}, password={default_password}")
PY

echo "Done."
