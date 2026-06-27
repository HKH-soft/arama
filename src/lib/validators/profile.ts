import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").trim().optional(),
  bio: z.string().max(500, "بیوگرافی نباید بیشتر از ۵۰۰ کاراکتر باشد").trim().optional(),
  phone: z.string().trim().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
