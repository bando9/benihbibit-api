import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import {
  GetProductParamSchema,
  PaginatedProductsSchema,
  ProductQuerySchema,
  ProductSchema,
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
    description: "Get Product with optional pagination and metadata",
    request: {
      query: ProductQuerySchema,
    },
    responses: {
      200: {
        description: "Successfully get products with optional pagination",
        content: { "application/json": { schema: PaginatedProductsSchema } },
      },
    },
  },
  async (c) => {
    const {
      page = 1,
      pageSize = 10,
      minPrice = 0,
      maxPrice = 1000000000,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = c.req.valid("query");

    const whereCondition: any = {};

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereCondition.price = {};
      if (minPrice !== undefined) {
        whereCondition.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        whereCondition.price.lte = maxPrice;
      }
    }

    const skip = (page - 1) * pageSize;

    const products = await prisma.product.findMany({
      take: pageSize,
      skip,
      where: whereCondition,
      orderBy: { [sortBy]: sortOrder },
    });

    // const totalCount = await prisma.product.count({
    //   where: whereCondition,
    // });
    // const totalPages = Math.ceil(totalCount / pageSize);

    return c.json(products, 200);
  },
);

// Search
productRoutes.openapi(
  {
    path: "/search",
    method: "get",
    request: {
      query: SearchQuerySchema,
    },
    tags,
    description: "Search product by name or sku",
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

// Detail
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
