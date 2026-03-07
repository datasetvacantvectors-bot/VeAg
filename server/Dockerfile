FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Ensure the temp directory used by multer exists
RUN mkdir -p temp

EXPOSE 5000

CMD ["node", "server.js"]
