FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

COPY .env.local .env.local

RUN npm run build

EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]