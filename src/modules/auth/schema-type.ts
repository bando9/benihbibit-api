import z from "zod";
import { UserSchema } from "../users/schema-type";

export const RegisterUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(3).openapi({ example: "password@123" }),
});

export const LoginUserSchema = RegisterUserSchema.omit({
  username: true,
  name: true,
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserSchema.pick({
    id: true,
    username: true,
    email: true,
    name: true,
  }),
});

export const TokenUserSchema = UserSchema.pick({ id: true });

export type TokenUserType = z.infer<typeof TokenUserSchema>;
export type RegisterUserType = z.infer<typeof RegisterUserSchema>;
export type LoginUserType = z.infer<typeof LoginUserSchema>;
export type LoginResponseType = z.infer<typeof LoginResponseSchema>;
