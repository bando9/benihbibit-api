import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { UserSchema } from "./schema-type";

export const userRoute = new OpenAPIHono();

const tag = ["users"];

userRoute.openapi(
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
      401: {
        description: "User not registered yet",
      },
    },
  },
  async (c) => {
    const user = await prisma.user.findMany();

    if (!user) {
      return c.json("User not registered yet", 401);
    }

    return c.json(user, 200);
  },
);
