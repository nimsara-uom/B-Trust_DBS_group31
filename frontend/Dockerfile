# Step 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package descriptors and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build production assets
COPY . .
RUN npm run build

# Step 2: Serve using Nginx
FROM nginx:alpine

# Copy built assets to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for React router support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
