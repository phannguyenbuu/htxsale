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

def find_payment_method_column():
    # Tìm tất cả các bảng có cột payment_method hoặc tương tự
    sql = """
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE (column_name ILIKE '%payment%' OR column_name ILIKE '%status%')
        AND table_schema = 'public';
    """
    
    psql_cmd = f"PGPASSWORD={DB_PASS} psql -h localhost -U {DB_USER} -d {DB_NAME} -c \"{sql}\""
    ssh_cmd = ["ssh", f"root@{VPS_IP}", psql_cmd]
    
    try:
        print(f"--- Đang tìm cột liên quan đến payment/status trên VPS ({VPS_IP})... ---")
        process = subprocess.Popen(ssh_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            print(stdout.decode('utf-8'))
        else:
            print(f"Lỗi: {stderr.decode('utf-8')}")
            
    except Exception as e:
        print(f"Lỗi hệ thống: {e}")

if __name__ == "__main__":
    find_payment_method_column()
