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

def run_vps_query():
    # Câu lệnh psql để chạy trên VPS
    psql_cmd = f"PGPASSWORD={DB_PASS} psql -h localhost -U {DB_USER} -d {DB_NAME} -c \"SELECT description FROM orders WHERE description IS NOT NULL AND description != '';\""
    
    # Lệnh SSH
    ssh_cmd = ["ssh", f"root@{VPS_IP}", psql_cmd]
    
    try:
        print(f"--- Đang truy vấn trên VPS ({VPS_IP})... ---")
        # Chạy lệnh và giải mã kết quả bằng UTF-8
        process = subprocess.Popen(ssh_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            print(stdout.decode('utf-8'))
        else:
            print(f"Lỗi: {stderr.decode('utf-8')}")
            
    except Exception as e:
        print(f"Lỗi hệ thống: {e}")

if __name__ == "__main__":
    run_vps_query()
