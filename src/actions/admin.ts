"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }
  return session;
}

export async function approveProperty(id: string) {
  await requireAdmin();
  await prisma.property.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      approvedAt: new Date(),
      publishedAt: new Date(),
    },
  });
  revalidatePath("/admin/imoveis");
  revalidatePath("/explorar");
}

export async function rejectProperty(id: string) {
  await requireAdmin();
  await prisma.property.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: "Rejeitado pelo administrador",
    },
  });
  revalidatePath("/admin/imoveis");
}
