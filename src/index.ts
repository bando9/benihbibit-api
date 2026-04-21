import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { Scalar } from "@scalar/hono-api-reference";
import { OpenAPIHono } from "@hono/zod-openapi";
import { helloRoute } from "./modules/common/route";
import { productRoute } from "./modules/products/route";
import { userRoute } from "./modules/users/route";
import { authRoute } from "./modules/auth/route";

const app = new OpenAPIHono();

app.use(logger());

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://benihbibit.bandomega.com",
      "https://benihbibit.bandomega.com",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["x-total", "x-page", "x-page-size", "x-total-pages"],
  }),
);

export const appRoutes = app
  .route("/hello", helloRoute)
  .route("/products", productRoute)
  .route("/users", userRoute)
  .route("/auth", authRoute);

// API Docs
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Benihbibit API",
    description:
      "Benihbibit API is a modern, lightweight e-commerce API built for managing and selling plant seeds and seedlings. It provides structured endpoints for product catalog, inventory management, and order processing, designed with scalability and developer experience in mind.",
  },
});

app.get("/", Scalar({ url: "/openapi.json" }));

export default app;
