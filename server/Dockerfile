FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3001
CMD ["node", "src/index.js"]