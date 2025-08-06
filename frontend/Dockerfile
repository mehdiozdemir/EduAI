# Frontend için multi-stage Dockerfile
FROM node:20-alpine as base

# Install python/make/g++ for native dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# Copy source code
COPY . .

# Build stage
FROM base as build

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Copy built application to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Development stage  
FROM base as development

# Install all dependencies including dev dependencies for development
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Add environment variables for development
ENV NODE_ENV=development
ENV NODE_OPTIONS="--openssl-legacy-provider"

# Expose port for development server
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
