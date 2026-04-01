FROM node:20-alpine AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run the application with Node.js
FROM node:20-alpine
WORKDIR /app

# Copy necessary files from build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/node_modules ./node_modules

# Expose the port from app.ts (defaults to 5000)
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start the Node.js server
CMD ["npm", "start"]
