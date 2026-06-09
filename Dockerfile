# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend & Production Image
FROM node:18-alpine
WORKDIR /app

# Install openssl for Prisma in alpine
RUN apk add --no-cache openssl

# Copy backend dependency configurations
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy backend source code
COPY backend/ ./

# Generate Prisma Client
RUN npx prisma generate

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose backend port
ENV PORT=3001
EXPOSE 3001

# Run database migrations and start application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
