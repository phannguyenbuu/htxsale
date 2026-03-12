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

def fix_and_update_vps():
    # Cập nhật status thay vì payment_method để không làm mất nội dung thanh toán gốc
    sql = """
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(20);
        UPDATE orders SET status = 'Chưa TT' 
        WHERE description ILIKE '%Chưa TT%' AND (status != 'Chưa TT' OR status IS NULL);
    """
    
    psql_cmd = f"PGPASSWORD={DB_PASS} psql -h localhost -U {DB_USER} -d {DB_NAME} -c \"{sql}\""
    ssh_cmd = ["ssh", f"root@{VPS_IP}", psql_cmd]
    
    try:
        print(f"--- Đang đồng bộ hóa cấu trúc và cập nhật dữ liệu (status) trên VPS ({VPS_IP})... ---")
        process = subprocess.Popen(ssh_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            print(stdout.decode('utf-8'))
            print("Thành công: Đã cập nhật trạng thái 'Chưa TT' vào cột status.")
        else:
            print(f"Lỗi: {stderr.decode('utf-8')}")
            
    except Exception as e:
        print(f"Lỗi hệ thống: {e}")

if __name__ == "__main__":
    fix_and_update_vps()
