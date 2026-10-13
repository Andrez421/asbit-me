# Static single-page portfolio. The page is fully self-contained (inline CSS, SVG
# and JS), so the image only needs nginx and the HTML file itself.
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html

EXPOSE 80
