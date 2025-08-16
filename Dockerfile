# Multi-stage Dockerfile: build with Node, serve with Nginx

## 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps first for better layer caching
COPY package.json ./
RUN npm install --no-audit --fund=false

# Copy rest of the source and build
COPY . .
RUN npm run build

## 2) Runtime stage
FROM nginx:1.27-alpine

# Simple nginx config for SPA
RUN echo 'server { listen 80; root /usr/share/nginx/html; index index.html; location / { try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]




