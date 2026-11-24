import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres").max(100),
    email: z.string().email("E-mail inválido"),
    phone: z.string().optional(),
    password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
    role: z.enum(["OWNER", "CLIENT"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Introduza a palavra-passe"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const propertySchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20).max(5000),
  type: z.enum([
    "APARTMENT",
    "HOUSE",
    "VILLA",
    "STUDIO",
    "COMMERCIAL",
    "LAND",
    "OFFICE",
    "WAREHOUSE",
  ]),
  province: z.string().min(1),
  municipality: z.string().min(1),
  neighborhood: z.string().min(1),
  address: z.string().min(3),
  monthlyPrice: z.number().positive(),
  bedrooms: z.number().int().min(0).default(0),
  bathrooms: z.number().int().min(0).default(0),
  areaSqm: z.number().optional().nullable(),
  isFurnished: z.boolean().default(false),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const visitRequestSchema = z.object({
  propertyId: z.string().min(1),
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().min(1),
  message: z.string().max(500).optional(),
});
