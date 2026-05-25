FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for Vite build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite frontend to the `dist` folder
RUN npm run build

# Expose the port the Express server runs on
EXPOSE 3001

# Start the Express server
CMD ["npm", "run", "start"]
