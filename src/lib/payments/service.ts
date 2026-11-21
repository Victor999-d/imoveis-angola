import { prisma } from "@/lib/prisma";
import { getProvider, getAvailableProviders } from "./providers";
import type { CreatePaymentInput, PaymentResult, PaymentMethod } from "./types";
import { Decimal } from "@prisma/client/runtime/library";

export async function initiatePayment(
  input: CreatePaymentInput
): Promise<PaymentResult & { paymentId?: string }> {
  const commission = await prisma.commission.findUnique({
    where: { id: input.commissionId },
    include: { deal: true },
  });

  if (!commission) {
    return { success: false, error: "Comissão não encontrada." };
  }

  if (commission.status === "PAID") {
    return { success: false, error: "Esta comissão já está paga." };
  }

  const amount = Number(commission.calculatedAmount);
  if (input.amount > amount) {
    return { success: false, error: "O valor excede a comissão devida." };
  }

  const provider = getProvider(input.method);
  const result = await provider.createPayment({
    ...input,
    amount: input.amount || amount,
  });

  if (!result.success) {
    return result;
  }

  const payment = await prisma.payment.create({
    data: {
      commissionId: input.commissionId,
      amount: new Decimal(input.amount || amount),
      method: input.method,
      reference: result.providerReference || input.reference,
      status: "PENDING",
      notes: input.notes || result.instructions,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "PAYMENT_INITIATED",
      entity: "Payment",
      entityId: payment.id,
      details: {
        method: input.method,
        amount: input.amount || amount,
        reference: result.providerReference,
      },
    },
  });

  return {
    success: true,
    paymentId: payment.id,
    providerReference: result.providerReference,
    instructions: result.instructions,
  };
}

export async function confirmPayment(
  paymentId: string,
  adminUserId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      commission: {
        include: { payments: true },
      },
    },
  });

  if (!payment) {
    return { success: false, error: "Pagamento não encontrado." };
  }

  if (payment.status === "CONFIRMED") {
    return { success: false, error: "Pagamento já confirmado." };
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "CONFIRMED",
      paidAt: new Date(),
      notes: notes || payment.notes,
    },
  });

  const confirmedTotal = payment.commission.payments
    .filter((p) => p.status === "CONFIRMED" || p.id === paymentId)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const commissionAmount = Number(payment.commission.calculatedAmount);

  if (confirmedTotal >= commissionAmount) {
    await prisma.commission.update({
      where: { id: payment.commissionId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      userId: adminUserId,
      action: "PAYMENT_CONFIRMED",
      entity: "Payment",
      entityId: paymentId,
      details: { notes },
    },
  });

  const deal = await prisma.deal.findUnique({
    where: { id: payment.commission.dealId },
  });

  if (deal) {
    await prisma.notification.create({
      data: {
        userId: deal.ownerId,
        type: "PAYMENT_CONFIRMED",
        title: "Pagamento de comissão confirmado",
        message: `O pagamento de ${Number(payment.amount).toLocaleString("pt-AO")} Kz foi confirmado.`,
        link: "/proprietario/comissoes",
      },
    });
  }

  return { success: true };
}

export function listPaymentMethods() {
  return getAvailableProviders().map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    requiresExternalApi: p.requiresExternalApi,
  }));
}

export function calculateCommission(
  monthlyRent: number,
  percentage: number,
  fixedAmount?: number | null
): number {
  const percentValue = (monthlyRent * percentage) / 100;
  if (fixedAmount && fixedAmount > 0) {
    return percentValue + fixedAmount;
  }
  return percentValue;
}
