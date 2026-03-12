import subprocess
import sys

# Đảm bảo đầu ra hiển thị đúng tiếng Việt
if sys.platform == "win32":
    import os
    os.system('chcp 65001')

VPS_IP = "31.97.76.62"
DB_NAME = "htxsale"
DB_USER = "postgres"
DB_PASS = "myPass"

def check_data_on_tables():
    # Kiểm tra số lượng bản ghi có desc 'Chưa TT' trong cả 3 bảng
    for table in ['"order"', 'bill', 'orders']:
        sql = f"SELECT count(*) FROM {table} WHERE description ILIKE '%Chưa TT%';"
        psql_cmd = f"PGPASSWORD={DB_PASS} psql -h localhost -U {DB_USER} -d {DB_NAME} -c \"{sql}\""
        ssh_cmd = ["ssh", f"root@{VPS_IP}", psql_cmd]
        
        try:
            print(f"--- Kiểm tra bảng {table} trên VPS ---")
            result = subprocess.run(ssh_cmd, capture_output=True, text=True, check=True)
            print(result.stdout)
        except Exception as e:
            print(f"Lỗi kiểm tra bảng {table}: {e}")

if __name__ == "__main__":
    check_data_on_tables()
