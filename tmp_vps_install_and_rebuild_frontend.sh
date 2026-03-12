set -e
cd /root/htxsale/frontend
npm install html2canvas --save
npm run build
rm -rf /var/www/htxsale/*
cp -r dist/* /var/www/htxsale/
echo "frontend ok"
