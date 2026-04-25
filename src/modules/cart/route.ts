import { OpenAPIHono } from "@hono/zod-openapi";
import { CartSchema } from "./schema";
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
