import { z } from "zod";
import { BlogPostStatus } from "@/types/enums";
import { slugify } from "@/utils/string";

export const adminBlogPostSchema = z.object({
  title: z
    .string()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(150, "O título deve ter no máximo 150 caracteres"),
  content: z
    .string()
    .min(10, "O conteúdo do post deve ter pelo menos 10 caracteres"),
  excerpt: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  status: z.nativeEnum(BlogPostStatus, {
    errorMap: () => ({ message: "Status de publicação inválido" }),
  }).default(BlogPostStatus.DRAFT),
  cover_image_url: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => !val || val.trim() === "" || /^https?:\/\/.+/i.test(val),
      { message: "URL de imagem de capa inválida" }
    ),
  slug: z
    .string()
    .optional()
    .transform((val, ctx) => {
      if (!val || val.trim() === "") return "";
      return slugify(val);
    }),
});

export type AdminBlogPostSchemaData = z.infer<typeof adminBlogPostSchema>;
