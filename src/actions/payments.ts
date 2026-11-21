"use server";

import { auth } from "@/lib/auth";
import {
  initiatePayment,
  confirmPayment,
  listPaymentMethods,
  calculateCommission,
} from "@/lib/payments/service";
import type { PaymentMethod } from "@/lib/payments/types";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPaymentMethods() {
  return listPaymentMethods();
}

export async function createPaymentAction(data: {
  commissionId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Não autenticado." };
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "OWNER") {
    return { error: "Sem permissão." };
  }

  const result = await initiatePayment(data);

  if (result.success) {
    revalidatePath("/admin/financeiro");
    revalidatePath("/proprietario/comissoes");
  }

  return result;
}

export async function confirmPaymentAction(
  paymentId: string,
  notes?: string
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Apenas administradores podem confirmar pagamentos." };
  }

  const result = await confirmPayment(paymentId, session.user.id, notes);

  if (result.success) {
    revalidatePath("/admin/financeiro");
    revalidatePath("/proprietario/comissoes");
  }

  return result;
}

export async function createCommissionForDeal(
  dealId: string,
  percentage?: number
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Sem permissão." };
  }

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { commission: true },
  });

  if (!deal) return { error: "Negócio não encontrado." };
  if (deal.commission) return { error: "Já existe comissão para este negócio." };

  const settings = await prisma.systemSetting.findUnique({
    where: { key: "default_commission_percentage" },
  });

  const pct =
    percentage ??
    (settings?.value as number) ??
    Number(process.env.DEFAULT_COMMISSION_PERCENTAGE || 10);

  const calculated = calculateCommission(Number(deal.agreedAmount), pct);

  const commission = await prisma.commission.create({
    data: {
      dealId,
      percentage: pct,
      calculatedAmount: calculated,
      status: "PENDING",
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notification.create({
    data: {
      userId: deal.ownerId,
      type: "COMMISSION_PENDING",
      title: "Comissão pendente",
      message: `Foi registada uma comissão de ${calculated.toLocaleString("pt-AO")} Kz referente ao negócio ${deal.referenceNumber}.`,
      link: "/proprietario/comissoes",
    },
  });

  revalidatePath("/admin/financeiro");
  return { success: true, commissionId: commission.id };
}
