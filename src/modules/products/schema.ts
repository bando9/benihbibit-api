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
});

export const SeedProductSchema = ProductSchema.omit({
  id: true,
});

export const ProductsSchema = z.array(ProductSchema);

export const SeedProductsSchema = z.array(SeedProductSchema);

export const GetProductParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .openapi({ example: "benih-lokal-organik-cosmos-20-biji" }),
});

export type Product = z.infer<typeof ProductSchema>;
export type Products = z.infer<typeof ProductsSchema>;

export type SeedProduct = z.infer<typeof SeedProductSchema>;
export type SeedProducts = z.infer<typeof SeedProductsSchema>;
