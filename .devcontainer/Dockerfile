FROM node:lts-bookworm-slim as builder

ARG VERSION

# hadolint ignore=DL3016
RUN npm install --global \
    wrangler@${VERSION}

# hadolint ignore=DL3007
FROM node:lts-bookworm-slim

ARG VERSION
ARG BUILD_DATE
ARG VCS_REF

ENV container=docker
ENV HOME=/home/node
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

LABEL maintainer="FX Soubirou <soubirou@yahoo.fr>" \
    org.opencontainers.image.title="wrangler" \
    org.opencontainers.image.description="A lightweight automatically updated debian nodejs image with wrangler" \
    org.opencontainers.image.authors="FX Soubirou <soubirou@yahoo.fr>" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.version="${VERSION}" \
    org.opencontainers.image.url="https://hub.docker.com/r/jfxs/wrangler" \
    org.opencontainers.image.source="https://gitlab.com/op_so/docker/wrangler" \
    org.opencontainers.image.revision=${VCS_REF} \
    org.opencontainers.image.created=${BUILD_DATE}

COPY package.json $HOME/
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=builder /usr/local/bin /usr/local/bin

# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b /usr/local/bin \
    && printf "[safe]\n  directory = /data\n" >> $HOME/.gitconfig

WORKDIR /data
