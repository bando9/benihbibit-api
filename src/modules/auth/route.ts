import { OpenAPIHono } from "@hono/zod-openapi";
import { RegisterUser } from "./schema-type";
import { UserSchema } from "../users/schema-type";

export const authRoute = new OpenAPIHono();

const tags = ["auth"];

authRoute.openapi(
  {
    path: "/register",
    method: "post",
    tags: tags,
    request: {
      body: { content: { "application/json": { schema: RegisterUser } } },
    },
    responses: {
      200: {
        description: "Success created new user",
        content: { "application/json": { schema: UserSchema } },
      },
      401: { description: "Failed register new user" },
    },
  },
  async (c) => {
    const validatedBody = c.req.valid("json");

    if (!validatedBody) {
      return c.json("Failed register new user", 401);
    }

    return c.json(validatedBody, 200);
  },
);
