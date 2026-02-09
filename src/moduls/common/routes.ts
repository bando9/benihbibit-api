import { Hono } from "hono";

export const commonRoutes = new Hono();

commonRoutes.get("/", (c) => {
  return c.json({
    title: "Benih Bibit API",
    products: "/products",
    users: "/users",
    cart: "/cart",
  });
});
