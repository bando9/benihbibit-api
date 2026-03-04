import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import {
  GetProductParamSchema,
  ProductSchema,
  ProductsSchema,
  SearchQuerySchema,
} from "./schema-type";

export const productRoutes = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          message: "Validation failed",
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        400,
      );
    }
  },
});

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
        content: { "application/json": { schema: ProductsSchema } },
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
    path: "/search",
    method: "get",
    request: {
      query: SearchQuerySchema,
    },
    tags,
    responses: {
      200: {
        description: "Success get query search",
      },
    },
  },
  async (c) => {
    const { q } = c.req.valid("query");
    const searchProduct = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (!searchProduct || searchProduct.length === 0) {
      return c.json("Product not found", 404);
    }

    return c.json(searchProduct, 200);
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
