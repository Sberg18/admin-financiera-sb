# Multi-stage build for production deployment
FROM node:18-alpine AS frontend-build

# Build frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production backend
FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy built frontend to backend/public
COPY --from=frontend-build /app/frontend/dist ./public

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]