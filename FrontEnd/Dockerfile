# ============================================
# SHMS Frontend - Dockerfile
# ============================================

# Stage 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .
# Accept build-time API base URL and export to build environment
ARG REACT_APP_BASE_URL
ENV REACT_APP_BASE_URL=${REACT_APP_BASE_URL:-http://localhost:3007}

# Build React app
RUN npm run build

# ============================================
# Stage 2: Production stage (Nginx)
# ============================================
FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
