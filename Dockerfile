# ===============================================
FROM registry.access.redhat.com/ubi9/nodejs-22 AS appbase
# ===============================================

WORKDIR /app

USER root
RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN yum -y install yarn

# Offical image has npm log verbosity as info. More info - https://github.com/nodejs/docker-node#verbosity
ENV NPM_CONFIG_LOGLEVEL=warn

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Global npm deps in a non-root user directory
ENV NPM_CONFIG_PREFIX=/app/.npm-global
ENV PATH=$PATH:/app/.npm-global/bin

# Yarn
ENV YARN_VERSION=1.22.22
RUN yarn policies set-version $YARN_VERSION

RUN chown -R default:root /app

USER default

# Copy package.json and package-lock.json/yarn.lock files
COPY --chown=default:root package.json yarn.lock /app/
COPY --chown=default:root ./scripts /app/scripts
COPY --chown=default:root ./public /app/public

# Install npm dependencies
ENV PATH=/app/node_modules/.bin:$PATH

RUN yarn config set network-timeout 300000
RUN yarn install --frozen-lockfile --ignore-scripts && yarn cache clean --force
RUN yarn update-runtime-env

COPY --chown=default:root index.html vite.config.mts eslint.config.js tsconfig.json .prettierrc .env* /app/
COPY --chown=default:root ./src /app/src
# =============================
FROM appbase AS development
# =============================

WORKDIR /app

# Set NODE_ENV to development in the development container
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Bake package.json start command into the image
CMD ["yarn", "start"]

# ===================================
FROM appbase AS staticbuilder
# ===================================

WORKDIR /app

RUN yarn build

# =============================
FROM registry.access.redhat.com/ubi9/nginx-122 AS production
# =============================

USER root

RUN chgrp -R 0 /usr/share/nginx/html && \
    chmod -R g=u /usr/share/nginx/html

# Copy static build
COPY --from=staticbuilder /app/build /usr/share/nginx/html

# Copy nginx config
COPY .prod/nginx.conf  /etc/nginx/nginx.conf
RUN mkdir /etc/nginx/env
COPY .prod/nginx_env.conf  /etc/nginx/env/

WORKDIR /usr/share/nginx/html

# Copy default environment config and setup script
COPY ./scripts/env.sh .
COPY .env .

# Copy package.json so env.sh can read it
COPY package.json .

RUN chmod +x env.sh

USER 1001

CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]

EXPOSE 8080
