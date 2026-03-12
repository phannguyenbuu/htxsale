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

def update_vps_status():
    # Câu lệnh UPDATE (dùng cột status)
    update_sql = "UPDATE orders SET status = 'Chưa TT' WHERE description ILIKE '%Chưa TT%' AND (status != 'Chưa TT' OR status IS NULL);"
    # Câu lệnh kiểm tra lại số lượng
    check_sql = "SELECT count(*) FROM orders WHERE status = 'Chưa TT';"
    
    psql_cmd = f"PGPASSWORD={DB_PASS} psql -h localhost -U {DB_USER} -d {DB_NAME} -c \"{update_sql}\" -c \"{check_sql}\""
    
    ssh_cmd = ["ssh", f"root@{VPS_IP}", psql_cmd]
    
    try:
        print(f"--- Đang cập nhật database trên VPS ({VPS_IP})... ---")
        process = subprocess.Popen(ssh_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            output = stdout.decode('utf-8')
            print(output)
        else:
            print(f"Lỗi: {stderr.decode('utf-8')}")
            
    except Exception as e:
        print(f"Lỗi hệ thống: {e}")

if __name__ == "__main__":
    update_vps_status()
