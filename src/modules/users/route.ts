import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { UserSchema } from "./schema";

export const userRoutes = new OpenAPIHono();

const tag = ["users"];

userRoutes.openapi(
  {
    path: "/",
    method: "get",
    description: "Get all Users",
    tags: tag,
    responses: {
      200: {
        content: { "application/json": { schema: UserSchema } },
        description: "Success get all users",
      },
      400: {
        description: "User not registered yet",
      },
    },
  },
  async (c) => {
    const user = await prisma.user.findMany();

    if (!user) {
      return c.json("User not registered yet", 400);
    }

    return c.json(user, 200);
  },
);
