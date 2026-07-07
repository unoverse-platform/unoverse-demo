# Multi-stage build → static nginx serve. Mirrors the GravitySAB deploy that works on
# DigitalOcean App Platform: build the SPA with Node, then serve dist/ with nginx. DO detects
# this Dockerfile and routes ingress to EXPOSE 80 — so there's no "no default process /
# start command required" failure that a buildpack Node service hits with a static build.
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat git
WORKDIR /app

# VITE_* are inlined into the bundle at BUILD time. DO passes build-time env vars as build
# args when a Dockerfile is used; declare them here so the values reach `npm run build`.
ARG VITE_UNOVERSE_URL
ARG VITE_API_URL
ARG VITE_AUTH_ISSUER
ARG VITE_AUTH_CLIENT_ID
ARG VITE_AUTH_AUDIENCE
ENV VITE_UNOVERSE_URL=$VITE_UNOVERSE_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_ISSUER=$VITE_AUTH_ISSUER
ENV VITE_AUTH_CLIENT_ID=$VITE_AUTH_CLIENT_ID
ENV VITE_AUTH_AUDIENCE=$VITE_AUTH_AUDIENCE

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
# SPA fallback: unknown paths (/sab, /bpp, /logout) → index.html so client routing resolves.
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
