import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { OpenAPIHono } from "@hono/zod-openapi";

const app = new OpenAPIHono();

app.use(logger());

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://benihbibit.bandomega.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

app.openapi(
  {
    method: "get",
    path: "/test",
    description: "get hello",
    responses: {
      200: {
        description: "Successfully get hello",
      },
    },
  },

  (c) => {
    const text = "Hello Benih Bibit here!";
    return c.json(text, 200);
  },
);

app.openapi(
  {
    method: "get",
    path: "/hello",
    description: "get hello test",
    responses: {
      200: {
        description: "Successfully get hello test",
      },
    },
  },

  (c) => {
    const text = "Hello, test!";
    return c.json(text, 200);
  },
);

// API Docs
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Benih Bibit API",
    description: "-",
  },
});

app.get("/", Scalar({ url: "/openapi.json" }));

export default app;
