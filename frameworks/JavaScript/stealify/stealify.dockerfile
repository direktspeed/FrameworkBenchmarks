FROM node:13
## deno
ARG DENO_VERSION=0.37.1
ENV DEBIAN_FRONTEND=noninteractive

RUN curl -fsSL https://github.com/denoland/deno/releases/download/v${DENO_VERSION}/deno_linux_x64.gz \
         --output deno.gz \
 && gunzip deno.gz \
 && chmod 777 deno \
 && mv deno /usr/bin/deno \
 && apt-get -qq clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN useradd --uid 1993 --user-group deno \
 && mkdir /deno-dir/ \
 && chown deno:deno /deno-dir/

ENV DENO_DIR /deno-dir/



## test
ARG TFB_TEST_NAME

COPY ./ ./app
WORKDIR /app
RUN npm install

ENV TFB_TEST_NAME=$TFB_TEST_NAME




CMD ["node", "app.js"]
