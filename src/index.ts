import { Hono } from "hono";
import { logger } from "hono/logger";
import { productRoutes } from "./moduls/products/routes";
import { commonRoutes } from "./moduls/common/routes";
import { cartRoutes } from "./moduls/carts/routes";

const app = new Hono();

app.use(logger());

const appRoutes = app
  .route("/", commonRoutes)
  .route("/products", productRoutes)
  .route("/cart", cartRoutes);

export default app;
