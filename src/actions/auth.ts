"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations";

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Dados inválidos. Verifique os campos." };
  }

  const { name, email, phone, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      ...(role === "OWNER"
        ? { ownerProfile: { create: {} } }
        : { clientProfile: { create: {} } }),
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "REGISTER",
      entity: "User",
      entityId: user.id,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "ACCOUNT_CREATED",
      title: "Conta criada com sucesso",
      message: `Bem-vindo(a) à Imóveis Angola, ${name}! A sua conta foi criada.`,
    },
  });

  return { success: true };
}
