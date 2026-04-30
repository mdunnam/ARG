#!/bin/bash
set -e

cat > /etc/nginx/conf.d/somnatek.conf << 'NGINXEOF'
server {
    server_name somnatek.org www.somnatek.org;
    root /var/www/somnatek;
    index index.html;

    location /api/portal-login {
        proxy_pass https://z65kgl0vef.execute-api.us-east-1.amazonaws.com/portal-login;
        proxy_http_version 1.1;
        proxy_set_header Host z65kgl0vef.execute-api.us-east-1.amazonaws.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/beacon {
        proxy_pass https://sun783h61e.execute-api.us-east-1.amazonaws.com/beacon;
        proxy_http_version 1.1;
        proxy_set_header Host sun783h61e.execute-api.us-east-1.amazonaws.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/admin {
        proxy_pass https://1ipinuiq08.execute-api.us-east-1.amazonaws.com/admin;
        proxy_http_version 1.1;
        proxy_set_header Host 1ipinuiq08.execute-api.us-east-1.amazonaws.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Admin-Token $http_x_admin_token;
    }

    # Hidden header clue on research page — players checking response headers
    location = /research.html {
        add_header X-Archive-Ref "7A-SUPP-001" always;
    }

    # Real admin console — not linked, not in robots.txt, requires header to prevent casual discovery
    location /site-mgmt/ {
        # Require a management header; without it the request returns 404 to blend in with broken links
        set $mgmt_ok 0;
        if ($http_x_site_key != "") { set $mgmt_ok 1; }
        if ($mgmt_ok = 0) { return 404; }
    }

    location / { try_files $uri $uri/ =404; }
    error_page 404 /404.html;
    location = /404.html { internal; }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/somnatek.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/somnatek.org/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
server {
    if ($host = www.somnatek.org) { return 301 https://$host$request_uri; }
    if ($host = somnatek.org)     { return 301 https://$host$request_uri; }
    listen 80 default_server;
    server_name somnatek.org www.somnatek.org;
    return 404;
}
NGINXEOF

nginx -t && systemctl reload nginx && echo NGINX_OK
