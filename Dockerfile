# --- Stage 1: Build ---
FROM node:20-alpine as builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Terima variable URL dari Docker Compose
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build project (Vite akan generate folder 'dist')
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Copy hasil build Vite (folder dist) ke folder Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Config tambahan agar routing SPA tidak error 404 saat refresh
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
