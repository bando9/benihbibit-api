import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import { GetProductParamSchema, ProductSchema } from "./schema";

export const productRoutes = new OpenAPIHono();

const tags = ["products"];

productRoutes.openapi(
  {
    path: "/",
    method: "get",
    tags,
    description: "Get All Product",
    responses: {
      200: {
        description: "Successfully get all products",
      },
    },
  },
  async (c) => {
    const products = await prisma.product.findMany();
    return c.json(products, 200);
  },
);

productRoutes.openapi(
  {
    path: "/{slug}",
    method: "get",
    tags,
    description: "Get Product by Slug",
    request: {
      params: GetProductParamSchema,
    },
    responses: {
      200: {
        content: { "application/json": { schema: ProductSchema } },
        description: "Successfully get product",
      },
      404: {
        description: "Product not found",
      },
    },
  },
  async (c) => {
    const slug = c.req.param("slug");

    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!product) {
      return c.json("Product not found", 404);
    }
    return c.json(product, 200);
  },
);
