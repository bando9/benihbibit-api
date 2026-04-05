import z from "zod";
import { UserSchema } from "../users/schema-type";

export const RegisterUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().openapi({ example: "password@123" }),
});

export const LoginUserSchema = RegisterUserSchema.omit({
  username: true,
  name: true,
}).extend({
  // username: z.string().optional().openapi({example: "example123"}),
  email: z.string().optional().openapi({ example: "example@example.com" }),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema,
});

export type RegisterUserTYpe = z.infer<typeof RegisterUserSchema>;
export type LoginUserType = z.infer<typeof LoginUserSchema>;
export type LoginResponseType = z.infer<typeof LoginResponseSchema>;
