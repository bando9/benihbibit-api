import z from "zod";
import { UserSchema } from "../users/schema-type";

export const RegisterUser = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().openapi({ example: "***" }),
});
