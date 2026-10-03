FROM nginx:1.27-alpine
LABEL org.opencontainers.image.title="xiaoe-education-admin"
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
