import { OpenAPIHono } from "@hono/zod-openapi";
import {
  AddItemSchema,
  CartItemSchema,
  CartSchema,
  DeleteItemParamsSchema,
} from "./schema";
import { checkAuthMiddleware } from "../auth/middleware";
import { prisma } from "../../lib/prisma";

const tags = ["cart"];

export const cartRoute = new OpenAPIHono();

// GET
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
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: "desc" },
          },
        },
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
      404: { description: "not found" },
    },
  },
  async (c) => {
    try {
      const user = c.get("user");
      const body = c.req.valid("json");

      const product = await prisma.product.findUnique({
        where: { id: body.productId },
      });

      if (!product) return c.json("product not found", 404);

      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!cart) {
        return c.notFound();
      }

      const existingItem = cart.items.find(
        (item) => item.productId === body.productId,
      );

      const currentQuantityItem = existingItem ? existingItem.quantity : 0;

      const totalRequestQuantity = currentQuantityItem + body.quantity;

      if (totalRequestQuantity > product.stockQuantity) {
        return c.json(
          `out of stock, stock ${product.name}: ${product.stockQuantity}`,
          400,
        );
      }

      const subTotalPrice = product.price * body.quantity;

      const cartItem = await prisma.cartItem.upsert({
        where: {
          uniqueCartItem: { cartId: cart.id, productId: body.productId },
        },
        update: {
          quantity: { increment: body.quantity },
          subTotalPrice: { increment: subTotalPrice },
        },
        create: {
          cartId: cart.id,
          productId: body.productId,
          quantity: body.quantity,
          subTotalPrice: subTotalPrice,
        },
      });

      return c.json(cartItem, 200);
    } catch (error) {
      console.log(error);
      return c.json("failed", 400);
    }
  },
);

// PUT  update items
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

      const product = await prisma.product.findUnique({
        where: { id: body.productId },
      });

      if (!product) return c.json("product not found", 404);

      const cart = await prisma.cart.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!cart) {
        return c.notFound();
      }

      const existingItem = cart.items.find(
        (item) => item.productId === body.productId,
      );

      const currentQuantityItem = existingItem ? existingItem.quantity : 0;

      const totalRequestQuantity = currentQuantityItem + body.quantity;

      if (totalRequestQuantity > product.stockQuantity) {
        return c.json(
          `out of stock, stock ${product.name}: ${product.stockQuantity}`,
          400,
        );
      }

      const subTotalPrice = product.price * body.quantity;

      const cartItem = await prisma.cartItem.upsert({
        where: {
          uniqueCartItem: { cartId: cart.id, productId: body.productId },
        },
        update: { quantity: body.quantity, subTotalPrice: subTotalPrice },
        create: {
          cartId: cart.id,
          productId: body.productId,
          quantity: body.quantity,
        },
      });

      return c.json(cartItem, 200);
    } catch (error) {
      console.log(error);
      return c.json(error, 400);
    }
  },
);

// DELETE by productId
cartRoute.openapi(
  {
    path: "/items/{productId}",
    method: "delete",
    middleware: checkAuthMiddleware,
    tags,
    request: {
      params: DeleteItemParamsSchema,
    },
    responses: {
      200: { description: "Success delete item" },
    },
  },
  async (c) => {
    const user = c.get("user");
    const { productId } = c.req.valid("param");

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      return c.notFound();
    }

    const deleteCartItem = await prisma.cartItem.delete({
      where: {
        uniqueCartItem: { cartId: cart.id, productId: productId },
      },
    });

    return c.json({ message: "success delete item", result: cart }, 200);
  },
);
