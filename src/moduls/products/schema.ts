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
