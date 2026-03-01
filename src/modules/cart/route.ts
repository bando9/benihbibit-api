import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";

export const cartRoutes = new OpenAPIHono();

const tags = ["cart"];

cartRoutes.openapi(
  {
    path: "/",
    method: "get",
    description: "Get cart product",
    tags,
    responses: {
      200: {
        description: "Success get cart product",
      },
    },
  },
  async (c) => {
    const carts = await prisma.product.findMany();
    return c.json(carts, 200);
  },
);
