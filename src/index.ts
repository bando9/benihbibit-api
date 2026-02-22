import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { OpenAPIHono } from "@hono/zod-openapi";
import { helloRoutes } from "./modules/common/routes";
import { productRoutes } from "./modules/products/routes";

const app = new OpenAPIHono();

app.use(logger());

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://benihbibit.bandomega.com"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

export const appRoutes = app
  .route("/hello", helloRoutes)
  .route("/products", productRoutes);

// API Docs
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Benihbibit API",
    description: "Benihbibit is ....",
  },
});

app.get("/", Scalar({ url: "/openapi.json" }));

export default app;
