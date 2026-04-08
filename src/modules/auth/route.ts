import { OpenAPIHono } from "@hono/zod-openapi";
import {
  LoginResponseSchema,
  LoginUserSchema,
  RegisterUserSchema,
} from "./schema-type";
import { UserSchema } from "../users/schema-type";
import { hashPassword, verifyPassword } from "../../lib/hash";
import { prisma } from "../../lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { signToken } from "../../lib/token";
import { checkAuthMiddleware } from "./middleware";

export const authRoute = new OpenAPIHono();

const tags = ["auth"];

authRoute.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
  description: "Enter your JWT token in the format: Bearer <token>",
});

authRoute.openapi(
  {
    path: "/register",
    method: "post",
    tags: tags,
    request: {
      body: {
        content: { "application/json": { schema: RegisterUserSchema } },
        required: true,
      },
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

      const newUser = await prisma.user.create({
        data: {
          name: validatedBody.name,
          email: validatedBody.email,
          username: validatedBody.username,
          password: {
            create: { hash: await hashPassword(validatedBody.password) },
          },
        },
      });

      return c.json(newUser, 201);
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return c.json("email or username already in use", 409);
        }
      }
      return c.json("Failed to register user", 400);
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

      const existingUser = await prisma.user.findUnique({
        where: {
          email: validatedBody.email,
        },
        include: {
          password: {
            select: { hash: true },
          },
        },
      });

      if (
        existingUser?.email !== validatedBody.email ||
        !existingUser?.password
      ) {
        return c.json("Failed login. wrong email / password", 401);
      }

      const isPasswordVerified = await verifyPassword(
        existingUser.password.hash,
        validatedBody.password,
      );

      if (!isPasswordVerified) {
        return c.json("Failed login. wrong email / password", 401);
      }

      const token = signToken(existingUser);

      return c.json(
        {
          token: token,
          user: {
            id: existingUser.id,
            username: existingUser.username,
            email: existingUser.email,
            name: existingUser.name,
          },
        },
        200,
      );
    } catch (error) {
      console.log(error);
      return c.json("Failed login, wrong email / password", 401);
    }
  },
);

authRoute.openapi(
  {
    path: "/me",
    method: "get",
    tags: tags,
    middleware: checkAuthMiddleware,
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
      const user = c.get("user");

      return c.json(user, 200);
    } catch (error) {
      console.log(error);
      return c.json("Failed to register user", 400);
    }
  },
);
