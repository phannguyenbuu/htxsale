set -e
echo "--- quyen@123 ---"
curl -s -X POST https://sale.quanlyhtx.com/api/login -H "Content-Type: application/json" -d '{"username":"quyen","password":"quyen@123"}'
echo
echo "--- admin/123456 ---"
curl -s -X POST https://sale.quanlyhtx.com/api/login -H "Content-Type: application/json" -d '{"username":"admin","password":"123456"}'
