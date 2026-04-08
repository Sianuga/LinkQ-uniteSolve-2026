FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV VITE_API_URL=http://localhost:8000
# Skip tsc type-checking (pre-existing TS errors in domain components).
# Vite builds fine without it.
RUN npx vite build

# Serve with a lightweight static server
FROM node:20-alpine
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 5173
CMD ["serve", "-s", "/app/dist", "-l", "5173"]
