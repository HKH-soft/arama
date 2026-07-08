import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد")
    .trim(),
  email: z.string().trim().email("ایمیل معتبر نیست").toLowerCase(),
  subject: z
    .string()
    .min(2, "موضوع باید حداقل ۲ کاراکتر باشد")
    .max(200, "موضوع نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
    .trim(),
  message: z
    .string()
    .min(10, "پیام باید حداقل ۱۰ کاراکتر باشد")
    .max(5000, "پیام نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد")
    .trim(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
