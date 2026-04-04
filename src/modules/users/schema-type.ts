import z from "zod";
import { UserModelSchema } from "../../generated/zod/schemas";

export const UserSchema = UserModelSchema.omit({
  password: true,
}).extend({
  name: z.string().openapi({ example: "Example" }),
  username: z.string().openapi({ example: "example123" }),
  email: z.string().openapi({ example: "example@example.com" }),
});

export const UsersSchema = UserSchema.array();

export type UserType = z.infer<typeof UserSchema>;
export type UsersType = z.infer<typeof UsersSchema>;

export const SeedUserSchema = UserModelSchema.omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export const SeedUsersSchema = SeedUserSchema.array();

export type SeedUser = z.infer<typeof SeedUserSchema>;
export type SeedUsers = z.infer<typeof SeedUsersSchema>;
