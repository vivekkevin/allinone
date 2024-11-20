# Use the official Node.js image for building
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Fix permission issues for `react-scripts`
RUN chmod +x ./node_modules/.bin/react-scripts

# Build the React app
RUN npm run build

# Use Nginx for serving the build files
FROM nginx:alpine

# Copy build output to Nginx directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
