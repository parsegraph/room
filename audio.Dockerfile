FROM localhost/parsegraph-stream:latest

COPY ./yarn.lock /usr/src/
CMD ["make", "demo"]
