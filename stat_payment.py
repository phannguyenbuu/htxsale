import subprocess
import sys

VPS_IP = "31.97.76.62"
DB_NAME = "htxsale"
DB_USER = "postgres"
DB_PASS = "myPass"

def run_vps_query():
    # Câu lệnh psql để kiểm tra bảng order (số ít)
    psql_cmd = f"PGPASSWORD={DB_PASS} psql -h localhost -U {DB_USER} -d {DB_NAME} -c \"\\d order; SELECT status, COUNT(*) FROM \\\"order\\\" GROUP BY status;\""
    
    # Lệnh SSH
    ssh_cmd = ["ssh", f"root@{VPS_IP}", psql_cmd]
    
    try:
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
