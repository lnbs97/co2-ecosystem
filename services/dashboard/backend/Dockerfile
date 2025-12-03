# Use a lightweight Node image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY server.js .

# Expose the port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]