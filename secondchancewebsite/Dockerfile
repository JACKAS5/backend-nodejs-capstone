# Use Node 18
FROM node:18-slim

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy everything else (index.js + build folder)
COPY . .

# Expose port
EXPOSE 9000

# Run the server
CMD ["node", "index.js"]
