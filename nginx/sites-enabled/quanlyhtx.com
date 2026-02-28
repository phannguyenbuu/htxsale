############################################################
# quanlyhtx.com / www.quanlyhtx.com
############################################################

server {
    listen 80;
    listen [::]:80;
    server_name quanlyhtx.com www.quanlyhtx.com;

    access_log /var/log/nginx/quanlyhtx.com.access.log;
    error_log  /var/log/nginx/quanlyhtx.com.error.log;

    root /var/www/letsencrypt;

    location ^~ /.well-known/acme-challenge/ {
        default_type "text/plain";
        allow all;
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name quanlyhtx.com www.quanlyhtx.com;

    access_log /var/log/nginx/quanlyhtx.com.ssl.access.log;
    error_log  /var/log/nginx/quanlyhtx.com.ssl.error.log;

    ssl_certificate     /etc/letsencrypt/live/quanlyhtx.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quanlyhtx.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type "text/plain";
        allow all;
        try_files $uri =404;
    }

    location = /upload {
        client_max_body_size 2048m;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_pass http://127.0.0.1:8006/upload;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /upload/ {
        client_max_body_size 2048m;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_pass http://127.0.0.1:8006/upload/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = / {
        return 302 /admin;
    }

    location = /admin {
        proxy_pass http://127.0.0.1:8006/admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ^~ /admin/ {
        proxy_pass http://127.0.0.1:8006/admin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8006;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
