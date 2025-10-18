# client/Dockerfile

# ---- Stage 1: Build ----
FROM node:18-alpine AS build

WORKDIR /app/client

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set build-time environment variable for the API URL
# This assumes your docker-compose service name for the server is 'server'
ARG VITE_API_URL=http://server:5000/api
ENV VITE_API_URL=${VITE_API_URL}
# Copy the public Stripe key from build args or env (can be set in docker-compose)
ARG VITE_STRIPE_KEY
ENV VITE_STRIPE_KEY=${VITE_STRIPE_KEY}


# Build the React app for production
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:stable-alpine AS final

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files from the build stage to Nginx html directory
COPY --from=build /app/client/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]