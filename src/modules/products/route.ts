import { OpenAPIHono } from "@hono/zod-openapi";
import { prisma } from "../../lib/prisma";
import {
  GetProductParamSchema,
  ProductQuerySchema,
  ProductSchema,
  ProductsSchema,
  SearchQuerySchema,
} from "./schema-type";

export const productRoute = new OpenAPIHono({
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

productRoute.openapi(
  {
    path: "/",
    method: "get",
    tags,
    description: "Get Products with optional pagination, filter, & sort",
    request: {
      query: ProductQuerySchema,
    },
    responses: {
      200: {
        description:
          "Successfully get products with optional pagination, filter, & sort",
        content: { "application/json": { schema: ProductsSchema } },
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
      q,
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

    if (q && q.trim() !== "") {
      const searchQuery = q.trim();

      whereCondition.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { sku: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const products = await prisma.product.findMany({
      take: pageSize,
      skip,
      where: whereCondition,
      orderBy: { [sortBy]: sortOrder },
    });

    const totalCount = await prisma.product.count({
      where: whereCondition,
    });
    const totalPages = Math.ceil(totalCount / pageSize);

    return c.json(products, 200, {
      "x-total": totalCount.toString(),
      "x-page": page.toString(),
      "x-page-size": pageSize.toString(),
      "x-total-pages": totalPages.toString(),
    });
  },
);

// Detail
productRoute.openapi(
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
