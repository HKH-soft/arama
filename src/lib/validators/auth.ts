import { z } from "zod";

// Password must have: lowercase, uppercase, digit, special char, min 8
export const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .regex(/[a-z]/, "رمز عبور باید شامل حرف کوچک باشد")
  .regex(/[A-Z]/, "رمز عبور باید شامل حرف بزرگ باشد")
  .regex(/[0-9]/, "رمز عبور باید شامل عدد باشد")
  .regex(/[^a-zA-Z0-9]/, "رمز عبور باید شامل کاراکتر ویژه باشد");

export const loginSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست").toLowerCase(),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").trim(),
  email: z.string().trim().email("ایمیل معتبر نیست").toLowerCase(),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("ایمیل معتبر نیست").toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
  newPassword: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
