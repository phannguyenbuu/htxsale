import subprocess
import sys

VPS_IP = "31.97.76.62"
DB_NAME = "htxsale"
DB_USER = "postgres"
DB_PASS = "myPass"

def fix_vps_data():
    # Cập nhật các đơn hàng đã paid mà trống payment_method
    sql = "UPDATE orders SET payment_method = 'Chuyển Khoản' WHERE (payment_method IS NULL OR payment_method = '') AND status = 'paid';"
    
    psql_cmd = f"PGPASSWORD={DB_PASS} psql -h localhost -U {DB_USER} -d {DB_NAME} -c \"{sql}\""
    ssh_cmd = ["ssh", f"root@{VPS_IP}", psql_cmd]
    
    try:
        print(f"--- Đang cập nhật phương thức thanh toán trống trên VPS... ---")
        process = subprocess.Popen(ssh_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            print(stdout.decode('utf-8'))
            print("Thành công: Đã cập nhật phương thức thanh toán mặc định.")
        else:
            print(f"Lỗi: {stderr.decode('utf-8')}")
            
    except Exception as e:
        print(f"Lỗi hệ thống: {e}")

if __name__ == "__main__":
    fix_vps_data()
