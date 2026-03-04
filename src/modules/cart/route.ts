import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";

export const cartRoutes = new OpenAPIHono();

const tags = ["cart"];

cartRoutes.openapi(
  {
    path: "/",
    method: "get",
    description: "Get user's cart",
    tags,
    responses: {
      200: {
        description: "Success Get user's cart",
      },
    },
  },
  async (c) => {
    return c.json({ message: "Get user's cart" }, 200);
  },
);
