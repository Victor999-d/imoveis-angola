"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createProperty(data: {
  title: string;
  description: string;
  type: string;
  province: string;
  municipality: string;
  neighborhood: string;
  address: string;
  monthlyPrice: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm?: number | null;
  isFurnished?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sessão inválida." };
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    return { error: "Apenas proprietários podem anunciar." };
  }

  const parsed = propertySchema.safeParse({
    ...data,
    isFurnished: !!data.isFurnished,
  });
  if (!parsed.success) {
    return { error: "Dados inválidos. Verifique os campos." };
  }

  const base = slugify(parsed.data.title) || "imovel";
  const slug = `${base}-${Date.now().toString(36)}`;

  await prisma.property.create({
    data: {
      ownerId: session.user.id,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      type: parsed.data.type as any,
      category: "RESIDENTIAL",
      status: "PENDING_VERIFICATION",
      province: parsed.data.province,
      municipality: parsed.data.municipality,
      neighborhood: parsed.data.neighborhood,
      address: parsed.data.address,
      monthlyPrice: parsed.data.monthlyPrice,
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
      areaSqm: parsed.data.areaSqm ?? undefined,
      isFurnished: parsed.data.isFurnished,
      amenities: [],
    },
  });

  revalidatePath("/proprietario/imoveis");
  revalidatePath("/explorar");
  return { success: true };
}
