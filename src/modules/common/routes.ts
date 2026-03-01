import { OpenAPIHono } from "@hono/zod-openapi";

export const helloRoutes = new OpenAPIHono();

const tags = ["hello"];

helloRoutes.openapi(
  {
    method: "get",
    path: "/",
    tags,
    description: "Hello Benih Bibit API",
    responses: {
      200: {
        description: "Successfully get hello",
        // content ...
      },
    },
  },

  (c) => {
    return c.json(
      {
        message: "Hello Benih Bibit API",
      },
      200,
    );
  },
);
