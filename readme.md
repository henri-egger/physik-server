# Server for wasserstand-eisack.it

### Renew certificates
```bash
sudo docker compose run --rm  certbot certonly --webroot --webroot-path /var/www/certbot/ -d wasserstand-eisack.it
```
