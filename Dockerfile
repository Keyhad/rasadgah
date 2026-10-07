# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22
ARG PLAYWRIGHT_VERSION=1.63.0

# ---- dependencies ------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM deps AS source
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .

# ---- development (hot reload, used with a bind mount) -------------------------
FROM source AS dev
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

# ---- static checks + unit tests ----------------------------------------------
FROM source AS test
CMD ["npm", "run", "verify"]

# ---- production build ----------------------------------------------------------
FROM source AS build
RUN npm run build

# ---- end-to-end tests (browsers preinstalled) ---------------------------------
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble AS e2e
WORKDIR /app
ENV CI=1 NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
CMD ["npm", "run", "test:e2e"]

# ---- runtime -----------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  HOSTNAME=0.0.0.0 \
  PORT=3000 \
  DATA_DIR=/data
RUN mkdir -p /data && chown node:node /data
COPY --from=build --chown=node:node /app/.next/standalone ./
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "server.js"]
