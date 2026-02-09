import { Hono } from "hono";

export const productRoutes = new Hono();

productRoutes.get("/", (c) => {
  return c.json("List products here!");
});
