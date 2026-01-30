# --- Етап 1: Збірка (Builder) ---
FROM node:22-alpine as builder

WORKDIR /app

# Копіюємо package.json
COPY package*.json ./

# Встановлюємо всі залежності (включно з react-scripts)
RUN npm install

# Копіюємо весь код
COPY . .

# Встановлюємо змінну середовища для збірки
# (Це важливо: під час збірки React "впікає" цю змінну в код)
# Ми вкажемо, що API буде доступне за тим же доменом через /api (налаштуємо це в Nginx)
# АБО ми можемо передати це через docker-compose. 
# Для початку давайте використаємо універсальний шлях:
# ENV REACT_APP_API_URL=http://localhost:5000/api

# Збираємо проєкт у папку /app/build
RUN npm run build

# --- Етап 2: Веб-сервер (Nginx) ---
FROM nginx:stable-alpine

# Копіюємо зібрані файли з першого етапу в папку Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Налаштування Nginx для React Router + API proxy
RUN echo 'server { \
    listen 80; \
    \
    # Proxy для API запитів -> Gateway \
    location /api/ { \
        proxy_pass http://gateway:3000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # React static files \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]