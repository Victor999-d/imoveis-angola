import type {
  PaymentProvider,
  CreatePaymentInput,
  PaymentResult,
  PaymentMethod,
} from "./types";

const bankTransferProvider: PaymentProvider = {
  id: "bank_transfer",
  name: "Transferência Bancária",
  description: "Transferência para a conta da plataforma. Confirmação manual pelo administrador.",
  isAvailable: true,
  requiresExternalApi: false,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const bankName = process.env.PAYMENT_BANK_NAME || "Banco de Fomento Angola (BFA)";
    const iban = process.env.PAYMENT_BANK_IBAN || "AO06 0000 0000 0000 0000 0000 0";
    const accountName = process.env.PAYMENT_BANK_ACCOUNT_NAME || "Imóveis Angola, Lda";

    const reference =
      input.reference ||
      `IA-${input.commissionId.slice(-8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      providerReference: reference,
      instructions: [
        `Transferência bancária`,
        `Banco: ${bankName}`,
        `Titular: ${accountName}`,
        `IBAN: ${iban}`,
        `Valor: ${input.amount.toLocaleString("pt-AO")} Kz`,
        `Referência a indicar: ${reference}`,
        ``,
        `Após a transferência, o administrador confirmará o pagamento.`,
      ].join("\n"),
    };
  },
};

const multicaixaProvider: PaymentProvider = {
  id: "multicaixa",
  name: "Multicaixa Express",
  description: "Pagamento por referência Multicaixa (requer integração com EMIS/parceiro).",
  isAvailable: !!process.env.MULTICAIXA_API_KEY,
  requiresExternalApi: true,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (!process.env.MULTICAIXA_API_KEY) {
      return {
        success: false,
        error:
          "Multicaixa não está configurado. Defina MULTICAIXA_API_KEY e MULTICAIXA_MERCHANT_ID.",
      };
    }

    const reference = `MC${Date.now().toString().slice(-10)}`;

    return {
      success: true,
      providerReference: reference,
      instructions: [
        `Referência Multicaixa: ${reference}`,
        `Valor: ${input.amount.toLocaleString("pt-AO")} Kz`,
        `Entidade: ${process.env.MULTICAIXA_ENTITY || "XXXXX"}`,
        ``,
        `Pague em qualquer terminal Multicaixa ou app bancária.`,
        `A confirmação é automática após o pagamento.`,
      ].join("\n"),
    };
  },
};

const unitelMoneyProvider: PaymentProvider = {
  id: "unitel_money",
  name: "Unitel Money",
  description: "Pagamento via Unitel Money (requer integração com Unitel).",
  isAvailable: !!process.env.UNITEL_MONEY_API_KEY,
  requiresExternalApi: true,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    if (!process.env.UNITEL_MONEY_API_KEY) {
      return {
        success: false,
        error: "Unitel Money não está configurado. Defina UNITEL_MONEY_API_KEY.",
      };
    }

    const reference = `UM${Date.now().toString().slice(-10)}`;

    return {
      success: true,
      providerReference: reference,
      instructions: [
        `Unitel Money`,
        `Referência: ${reference}`,
        `Valor: ${input.amount.toLocaleString("pt-AO")} Kz`,
        `Número: ${process.env.UNITEL_MONEY_MERCHANT || "9XX XXX XXX"}`,
        ``,
        `Confirme o pagamento na app Unitel Money.`,
      ].join("\n"),
    };
  },
};

const cashProvider: PaymentProvider = {
  id: "cash",
  name: "Numerário",
  description: "Pagamento em dinheiro. Registo e confirmação manual.",
  isAvailable: true,
  requiresExternalApi: false,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const reference = `CASH-${input.commissionId.slice(-6).toUpperCase()}`;

    return {
      success: true,
      providerReference: reference,
      instructions:
        "Pagamento em numerário. O administrador deve confirmar o recebimento manualmente.",
    };
  },
};

export const paymentProviders: Record<PaymentMethod, PaymentProvider> = {
  bank_transfer: bankTransferProvider,
  multicaixa: multicaixaProvider,
  unitel_money: unitelMoneyProvider,
  cash: cashProvider,
  other: bankTransferProvider,
};

export function getAvailableProviders(): PaymentProvider[] {
  return Object.values(paymentProviders).filter((p) => p.isAvailable);
}

export function getProvider(method: PaymentMethod): PaymentProvider {
  return paymentProviders[method] || bankTransferProvider;
}
