#!/bin/bash

# Установка зависимостей
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm nginx mariadb-server

# Настройка MariaDB
sudo mysql -e "CREATE DATABASE IF NOT EXISTS timer_db;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'timer_admin'@'localhost' IDENTIFIED BY 'secure_password_123';"
sudo mysql -e "GRANT ALL PRIVILEGES ON timer_db.* TO 'timer_admin'@'localhost';"

# Установка Node.js модулей
cd backend
npm install
cd ..

# Копирование конфига Nginx
sudo cp nginx-config/timer-app /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/timer-app /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Запуск сервера
sudo npm install -g pm2
pm2 start backend/server.js
pm2 save
pm2 startup