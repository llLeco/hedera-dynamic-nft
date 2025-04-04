# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public

# Create a user with restricted permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Switch to non-root user
USER nestjs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"] 