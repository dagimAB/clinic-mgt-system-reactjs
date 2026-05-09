# ============================================
# SHMS Backend - Dockerfile
# ============================================

# Stage 1: Base image with Node.js
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy application code
COPY . .

# ============================================
# Stage 2: Production image (minimal)
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy node_modules and app from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app . 

# Expose port
EXPOSE 3007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3007', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "index.js"]
