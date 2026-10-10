FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

EXPOSE 5174

# Run Vite dev server in host mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
