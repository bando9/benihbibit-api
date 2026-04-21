import { z } from "@hono/zod-openapi";

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  sku: z.string(),
  price: z.int(),
  stockQuantity: z.int(),
  imageUrl: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const SeedProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const ProductsSchema = z.array(ProductSchema);
export const SeedProductsSchema = z.array(SeedProductSchema);

export const GetProductParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .openapi({ example: "benih-lokal-organik-cosmos-20-biji" }),
});

export const SearchQuerySchema = z.object({
  q: z.string().openapi({ example: "Marigold" }),
});

export const ProductQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(10),
  minPrice: z.coerce.number().optional().default(0),
  maxPrice: z.coerce.number().optional().default(1000000000),
  sortOrder: z.enum(["desc", "asc"]).optional().default("desc"),
  sortBy: z
    .enum(["createdAt", "price", "name"])
    .optional()
    .default("createdAt"),
  q: z.string().optional(),
});

// Type
export type ProductType = z.infer<typeof ProductSchema>;
export type ProductsType = z.infer<typeof ProductsSchema>;
export type SeedProductsType = z.infer<typeof SeedProductsSchema>;
