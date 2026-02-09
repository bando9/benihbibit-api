import { Hono } from "hono";

export const cartRoutes = new Hono();

cartRoutes.get("/", (c) => {
  return c.json("List carts here!");
});
