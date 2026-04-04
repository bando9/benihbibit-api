import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { GetUserParamsSchema, UserSchema } from "./schema-type";

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

userRoute.openapi(
  {
    path: "/{id}",
    method: "get",
    description: "Get one user",
    tags: tag,
    request: {
      params: GetUserParamsSchema,
    },
    responses: {
      200: {
        content: { "application/json": { schema: UserSchema } },
        description: "Success get one user",
      },
      401: {
        description: "User not registered yet",
      },
    },
  },
  async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return c.json("User not registered yet", 401);
    }

    return c.json(user, 200);
  },
);
