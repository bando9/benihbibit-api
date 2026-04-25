import z from "zod";
import { ProductSchema } from "../products/schema-type";

export const CartItemSchema = z.object({
  id: z.string(),

  product: ProductSchema,
  productId: z.string(),

  quantity: z.number().int(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CartItemsSchema = z.array(CartItemSchema);

export const CartSchema = z.object({
  id: z.string(),

  userId: z.string(),
  items: CartItemsSchema,

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AddItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int(),
});
