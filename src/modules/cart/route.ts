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

// PUT : update items
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

// POST items for add button
cartRoute.openapi(
  {
    path: "/items",
    method: "post",
    middleware: checkAuthMiddleware,
    tags,
    request: {
      body: { content: { "application/json": { schema: AddItemSchema } } },
    },
    responses: {
      200: { description: "Success add product" },
      400: { description: "Failed" },
    },
  },
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!cart) {
      return c.notFound();
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        id: cart.id,
      },
      update: { quantity: { increment: body.quantity } },
      create: {
        cartId: cart.id,
        productId: body.productId,
        quantity: body.quantity,
      },
    });

    return c.json(cartItem, 200);
  },
);
