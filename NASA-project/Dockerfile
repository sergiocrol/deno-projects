FROM hayd/deno:alpine-1.3.3

WORKDIR /app

COPY . .

USER deno

CMD ["run", "--allow-net", "--allow-read", "./mod.ts"]

EXPOSE 8000