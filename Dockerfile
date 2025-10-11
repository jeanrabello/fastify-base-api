# Base stage - common parts
FROM node:22.12.0-alpine AS base

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Development stage
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Command for development (with hot reload)
CMD ["npm", "run", "dev"]

# Build stage - installs dev dependencies and compiles TypeScript
FROM base AS build

# Install all dependencies (including dev) for build
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production stage - only production deps + compiled output
FROM node:22.12.0-alpine AS production

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of files
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Command for production
CMD ["npm", "start"]