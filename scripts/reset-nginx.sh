#!/bin/bash
# Script để khởi động lại Nginx service một cách nhanh chóng (zero-downtime)

echo "Reloading Nginx configuration..."
docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload
echo "Nginx reloaded successfully!"
