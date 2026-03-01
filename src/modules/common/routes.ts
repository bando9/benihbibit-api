import { OpenAPIHono } from "@hono/zod-openapi";

export const helloRoutes = new OpenAPIHono();

const tags = ["hello"];

helloRoutes.openapi(
  {
    method: "get",
    path: "/",
    tags,
    description: "get hello test",
    responses: {
      200: {
        description: "Successfully get hello test",
      },
    },
  },

  (c) => {
    const text = "Hello, test!";
    return c.json(text, 200);
  },
);
