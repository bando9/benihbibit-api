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

export const SeedUserSchema = UserModelSchema.omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export const SeedUsersSchema = SeedUserSchema.array();

export const PublicUserSchema = UserSchema.omit({
  email: true,
});

export const PublicUsersSchema = PublicUserSchema.array();

export const GetUserParamsSchema = z.object({
  id: z.string().openapi({ example: "7H1S1S1DNUM83R" }),
});

export type UserType = z.infer<typeof UserSchema>;
export type UsersType = z.infer<typeof UsersSchema>;

export type PublicUserType = z.infer<typeof PublicUserSchema>;
export type PublicUsersType = z.infer<typeof PublicUsersSchema>;

export type SeedUser = z.infer<typeof SeedUserSchema>;
export type SeedUsers = z.infer<typeof SeedUsersSchema>;
