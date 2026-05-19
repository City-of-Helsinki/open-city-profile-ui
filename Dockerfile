# ============================================================
# STAGE 1: Build the Static Assets
# ============================================================
FROM helsinki.azurecr.io/ubi9/nodejs-22-pnpm-builder-base AS appbase

# 1. Copy only necessary files for build
COPY --chown=default:root package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
COPY --chown=default:root ./scripts /app/scripts
COPY --chown=default:root ./public /app/public
COPY --chown=default:root index.html vite.config.mts eslint.config.js tsconfig.json .prettierrc .env* /app/
COPY --chown=default:root ./src /app/src

# 2. Run the install and update-runtime-env script
# corepack in the base image will automatically use the version of pnpm
# defined in your package.json 'packageManager' field if present.
RUN pnpm install --frozen-lockfile --ignore-scripts && pnpm store prune
RUN pnpm update-runtime-env

# ============================================================
# STAGE 2: Development
# ============================================================
FROM appbase AS development

WORKDIR /app

# Set NODE_ENV to development in the development container
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

EXPOSE 8080

CMD pnpm exec vite --port 8080

# ===================================
FROM appbase AS staticbuilder
# ===================================

# Set environmental variables
ARG REACT_APP_SENTRY_RELEASE

RUN pnpm build

# ============================================================
# STAGE 4: Production Runtime
# ============================================================
FROM helsinki.azurecr.io/ubi9/nginx-126-spa-standard AS production

ARG REACT_APP_SENTRY_RELEASE
ENV APP_RELEASE=${REACT_APP_SENTRY_RELEASE:-""}
# 1. Copy the compiled assets
COPY --from=staticbuilder /app/build /usr/share/nginx/html

# 2. Setup Runtime Env Injection
# env.sh is provided by the base image
WORKDIR /usr/share/nginx/html
COPY .env .

# 3. Inject Versioning for the /readiness endpoint from package.json using base image
COPY package.json .

# - env.sh      (Inherited from base image at /usr/share/nginx/html/env.sh)
# - USER 1001   (Inherited from base image)
# - EXPOSE 8080 (Inherited from base image)
# - ENTRYPOINT/CMD (Inherited from base image)
