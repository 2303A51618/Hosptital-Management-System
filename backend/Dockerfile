FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY . .

# Environment
ENV NODE_ENV=production

# Expose runtime port (set by platform via PORT env; default 8080)
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
