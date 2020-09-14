import { log } from "./deps.ts"

import { Application, send } from "./deps.ts";

import api from "./api.ts";

const app = new Application();
const PORT = 8000;

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO")
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"]
    }
  }
})

// Listen for the throw error of the below middleware, and launches the log.error
app.addEventListener("error", (event) => {
  log.error(event.error);
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch(error) {
    ctx.response.body = "Internal Server Error";
    throw error;
  }
})

app.use(async (ctx, next) => {
  // We can customize errors with throw method of context
  // ctx.throw(400, "Sorry, the planets are not available!")
  await next();
  const time = ctx.response.headers.get("X-Response-Time")
  log.info(time);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const delta = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${delta}ms`)
});

// Everything that doesn't match with the api's routes, will pass to the next middleware
// in this case the static file.
app.use(api.routes());
app.use(api.allowedMethods());

// Serve a static file throught DENO
app.use(async (ctx) => {
  const filePath = ctx.request.url.pathname;
  const fileWhitelist = [
    "/index.html",
    "/javascripts/script.js",
    "/stylesheets/style.css",
    "/images/favicon.png",
    "/videos/space.mp4"
  ];
  if (fileWhitelist.includes(filePath)) {
    await send(ctx, filePath, {
      root: `${Deno.cwd()}/public` 
    })
  }
})


if (import.meta.main) {
  log.info(`Starting server on port ${PORT}...`)
  await app.listen({
    port: PORT
  });
}
