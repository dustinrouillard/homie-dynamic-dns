FROM alpine

LABEL org.opencontainers.image.source=https://github.com/dustinrouillard/homie-dynamic-dns

RUN echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories
RUN apk update
RUN apk add ddclient

COPY start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT [ "/start.sh" ]
