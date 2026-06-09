# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend + Production Image
FROM node:18-alpine
WORKDIR /app

RUN apk add --no-cache openssl

COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev

COPY backend/ ./

RUN npx prisma generate

COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

ENV PORT=3001
EXPOSE 3001

# db push tự tạo bảng nếu chưa có, rồi start server
CMD ["sh", "-c", "npx prisma db push && npm start"]
