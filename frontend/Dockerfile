# syntax=docker/dockerfile:1

# Build stage: Vite compiles the React application into static files.
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite embeds this public URL in the JavaScript bundle at build time.
ARG VITE_API_URL=/api/
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Runtime stage: Nginx serves only the compiled static files.
FROM nginx:1.30.4-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --output-document=/dev/null http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
