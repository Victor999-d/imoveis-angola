"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createPaymentIntent,
  verifyPayment,
  type PaymentMethod,
} from "@/lib/payments";
import { revalidatePath } from "next/cache";

export async function initiateCommissionPayment(input: {
  commissionId: string;
  method: PaymentMethod;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Sessão inválida" };

  const commission = await prisma.commission.findUnique({
    where: { id: input.commissionId },
    include: { deal: true },
  });

  if (!commission) return { error: "Comissão não encontrada" };
  if (commission.status === "PAID") return { error: "Comissão já paga" };

  const amount = Number(commission.calculatedAmount);

  try {
    const intent = await createPaymentIntent({
      amount,
      method: input.method,
      description: `Comissão #${commission.id.slice(-8)} — Imóveis Angola`,
      reference: commission.id,
      customerName: session.user.name || undefined,
      customerEmail: session.user.email || undefined,
      metadata: {
        commissionId: commission.id,
        userId: session.user.id,
      },
    });

    await prisma.payment.create({
      data: {
        commissionId: commission.id,
        amount,
        method: input.method,
        reference: intent.providerReference || intent.id,
        status: "PENDING",
        notes: intent.instructions || undefined,
      },
    });

    revalidatePath("/admin/financeiro");
    revalidatePath("/pagamentos");

    return { success: true, intent };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao iniciar pagamento",
    };
  }
}

export async function initiateCustomPayment(input: {
  amount: number;
  method: PaymentMethod;
  description: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Sessão inválida" };
  if (input.amount < 100) return { error: "Valor mínimo: 100 Kz" };

  try {
    const intent = await createPaymentIntent({
      amount: input.amount,
      method: input.method,
      description: input.description || "Pagamento Imóveis Angola",
      customerName: session.user.name || undefined,
      customerEmail: session.user.email || undefined,
      metadata: { userId: session.user.id },
    });

    return { success: true, intent };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Erro ao iniciar pagamento",
    };
  }
}

export async function confirmSandboxPayment(input: {
  providerReference: string;
  commissionId?: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Sessão inválida" };

  const intent = await verifyPayment("SANDBOX", input.providerReference);

  if (intent.status === "CONFIRMED" && input.commissionId) {
    await prisma.payment.updateMany({
      where: {
        commissionId: input.commissionId,
        reference: input.providerReference,
      },
      data: {
        status: "CONFIRMED",
        paidAt: new Date(),
      },
    });
    await prisma.commission.update({
      where: { id: input.commissionId },
      data: { status: "PAID", paidAt: new Date() },
    });
  }

  revalidatePath("/admin/financeiro");
  revalidatePath("/pagamentos");
  return { success: true, intent };
}

export async function markPaymentPaidManual(paymentId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Apenas administradores" };
  }

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "CONFIRMED", paidAt: new Date() },
  });

  await prisma.commission.update({
    where: { id: payment.commissionId },
    data: { status: "PAID", paidAt: new Date() },
  });

  revalidatePath("/admin/financeiro");
  return { success: true };
}
