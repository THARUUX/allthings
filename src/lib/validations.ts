import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const articleSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(150, "Title is too long"),
  summary: z.string().min(10, "Summary must be at least 10 characters").max(300, "Summary is too long"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  coverImage: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Please select a category"),
  tagNames: z.array(z.string()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
