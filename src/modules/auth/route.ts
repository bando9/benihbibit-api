import { OpenAPIHono } from "@hono/zod-openapi";
import {
  LoginResponseSchema,
  LoginUserSchema,
  RegisterUserSchema,
} from "./schema-type";
import { UserSchema } from "../users/schema-type";
import { hashPassword } from "../../lib/hash";
import { prisma } from "../../lib/prisma";

export const authRoute = new OpenAPIHono();

const tags = ["auth"];

authRoute.openapi(
  {
    path: "/register",
    method: "post",
    tags: tags,
    request: {
      body: { content: { "application/json": { schema: RegisterUserSchema } } },
    },
    responses: {
      201: {
        description: "Success created new user",
        content: { "application/json": { schema: UserSchema } },
      },
      400: { description: "Failed register new user" },
      409: { description: "Email or username have been used" },
    },
  },
  async (c) => {
    try {
      const validatedBody = c.req.valid("json");

      if (!validatedBody) {
        return c.json("Failed register new user", 400);
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: validatedBody.email },
            { username: validatedBody.username },
          ],
        },
      });

      if (existingUser) {
        return c.json("Email or username have been used", 409);
      }

      const registerUser = await prisma.user.create({
        data: {
          name: validatedBody.name,
          email: validatedBody.email,
          username: validatedBody.username,
          password: {
            create: { hash: await hashPassword(validatedBody.password) },
          },
        },
      });

      return c.json(registerUser, 201);
    } catch (error) {
      console.log(error);
      return c.json("Failed register new user", 400);
    }
  },
);

authRoute.openapi(
  {
    path: "/login",
    method: "post",
    tags: tags,
    request: {
      body: { content: { "application/json": { schema: LoginUserSchema } } },
    },
    responses: {
      200: {
        description: "Success login user",
        content: { "application/json": { schema: LoginResponseSchema } },
      },
      401: { description: "Failed login, wrong email / password" },
    },
  },
  async (c) => {
    try {
      const validatedBody = c.req.valid("json");

      const user = await prisma.user.findUnique({
        where: {
          email: validatedBody.email,
        },
        include: {
          password: {
            select: { hash: true },
          },
        },
      });

      return c.json(
        {
          token: "",
          user: user,
        },
        200,
      );
    } catch (error) {
      console.log(error);
      return c.json("Failed login, wrong email / password", 401);
    }
  },
);
