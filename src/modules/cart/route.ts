import { OpenAPIHono } from "@hono/zod-openapi";
import { AddItemSchema, CartItemSchema, CartSchema } from "./schema";
import { checkAuthMiddleware } from "../auth/middleware";
import { prisma } from "../../lib/prisma";

const tags = ["cart"];

export const cartRoute = new OpenAPIHono();

cartRoute.openapi(
  {
    path: "/",
    method: "get",
    middleware: checkAuthMiddleware,
    tags,
    description: "Get cart user",
    responses: {
      200: {
        description: "Get user's cart",
        content: { "application/json": { schema: CartSchema } },
      },
      404: {
        description: "cart user not found",
      },
    },
  },
  async (c) => {
    try {
      const user = c.get("user");

      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      if (!cart) {
        const newCart = await prisma.cart.create({
          data: { userId: user.id },
          include: { items: { include: { product: true } } },
        });
        return c.json(newCart, 201);
      }

      return c.json(cart, 200);
    } catch (error) {
      console.log(error);
      return c.json("cart user not found", 404);
    }
  },
);

cartRoute.openapi(
  {
    path: "/items",
    method: "put",
    middleware: checkAuthMiddleware,
    tags,
    request: {
      body: { content: { "application/json": { schema: AddItemSchema } } },
    },
    responses: {
      200: {
        description: "update items",
        content: { "application/json": { schema: CartItemSchema } },
      },
      404: { description: "items empty" },
    },
  },
  async (c) => {
    try {
      const user = c.get("user");
      const body = c.req.valid("json");

      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: { items: { include: { product: true } } },
      });

      if (!cart) {
        return c.notFound();
      }

      const newCartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: body.productId,
          quantity: body.quantity,
        },
      });

      return c.json(newCartItem);
    } catch (error) {
      console.log(error);
      return c.json(error);
    }
  },
);

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMUtQSjVKUVlZRTk2NVpZM1NTNFg0MUgyUyIsImlhdCI6MTc3NzA4ODY3MywiZXhwIjoxNzc3NjkzNDczfQ.qIB-7YqM8EpGn3fXifpNFKuGpVG6LuLiX1dMGI0WP_c
