Гайс если вы это читаете то мне вас жаль так как я это сделал через deepseek для школы как практикант
Если вы поняли что тоже хотите внедрить включаемый firewall для своей организации то юзайте вот вам шаги по установке, но учитывайте что вас должна стоять какая-нибудь mariadb и nginx
А и вам там надо покапаться чтоб найти где изменить вкл/выкл правило по стандарту там 14
Установите зависимости: sudo apt install git nodejs npm nginx mariadb-server
Клонируйте репозиторий: git clone https://github.com/your_repo.git
Настройте .env файл в папке backend(для обращение к роутеру(в моём случае микротик какой-то там))
Запустите chmod +x install.sh && sudo ./install.sh
Откройте в браузере: http://your_domain.com
