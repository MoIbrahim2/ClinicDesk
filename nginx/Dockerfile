# Build stage for frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY clinic-desk-frontend/package*.json ./
RUN npm install
COPY clinic-desk-frontend/ ./
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
