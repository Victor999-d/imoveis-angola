import type {
  PaymentProvider,
  CreatePaymentInput,
  PaymentResult,
  PaymentMethod,
} from "./types";

function fmt(amount: number) {
  return amount.toLocaleString("pt-AO");
}

const bankTransferProvider: PaymentProvider = {
  id: "BANK_TRANSFER",
  name: "Transferência Bancária",
  label: "Transferência Bancária",
  description:
    "Transferência para a conta da plataforma. Confirmação manual pelo administrador.",
  isAvailable: true,
  requiresExternalApi: false,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const bankName =
      process.env.BANK_NAME ||
      process.env.PAYMENT_BANK_NAME ||
      "Banco de Fomento Angola (BFA)";
    const iban =
      process.env.BANK_IBAN ||
      process.env.PAYMENT_BANK_IBAN ||
      "AO06 0000 0000 0000 0000 0000 0";
    const accountName =
      process.env.BANK_ACCOUNT_NAME ||
      process.env.PAYMENT_BANK_ACCOUNT_NAME ||
      "Imóveis Angola, Lda";
    const reference =
      input.reference ||
      `IA-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      providerReference: reference,
      instructions: [
        `Transferência bancária`,
        `Banco: ${bankName}`,
        `Titular: ${accountName}`,
        `IBAN: ${iban}`,
        `Valor: ${fmt(input.amount)} Kz`,
        `Referência a indicar: ${reference}`,
        ``,
        `Após a transferência, o administrador confirmará o pagamento.`,
      ].join("\n"),
    };
  },
};

const multicaixaProvider: PaymentProvider = {
  id: "MULTICAIXA",
  name: "Multicaixa Express",
  label: "Multicaixa Express",
  description: "Pagamento por referência Multicaixa",
  isAvailable: true,
  requiresExternalApi: !!process.env.MULTICAIXA_API_KEY,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const reference = `MC${Date.now().toString().slice(-10)}`;
    return {
      success: true,
      providerReference: reference,
      instructions: [
        `Referência Multicaixa: ${reference}`,
        `Valor: ${fmt(input.amount)} Kz`,
        `Entidade: ${process.env.MULTICAIXA_ENTITY || "XXXXX"}`,
        ``,
        `Pague em qualquer terminal Multicaixa ou app bancária.`,
        process.env.MULTICAIXA_API_KEY
          ? `A confirmação pode ser automática.`
          : `(API não configurada — confirmação manual pelo admin.)`,
      ].join("\n"),
    };
  },
};

const unitelMoneyProvider: PaymentProvider = {
  id: "UNITEL_MONEY",
  name: "Unitel Money",
  label: "Unitel Money",
  description: "Pagamento via Unitel Money",
  isAvailable: true,
  requiresExternalApi: !!process.env.UNITEL_MONEY_API_KEY,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const reference = `UM${Date.now().toString().slice(-10)}`;
    return {
      success: true,
      providerReference: reference,
      instructions: [
        `Unitel Money`,
        `Referência: ${reference}`,
        `Valor: ${fmt(input.amount)} Kz`,
        `Número: ${process.env.UNITEL_MONEY_MERCHANT || "9XX XXX XXX"}`,
        ``,
        `Confirme o pagamento na app Unitel Money.`,
      ].join("\n"),
    };
  },
};

const sandboxProvider: PaymentProvider = {
  id: "SANDBOX",
  name: "Sandbox (teste)",
  label: "Sandbox (teste)",
  description: "Simula pagamentos sem gateway real",
  isAvailable: true,
  requiresExternalApi: false,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const reference = `SBX-${Date.now().toString(36).toUpperCase()}`;
    return {
      success: true,
      providerReference: reference,
      instructions:
        "Modo sandbox: use «Confirmar pagamento de teste» na página de pagamentos.",
    };
  },
};

const cashProvider: PaymentProvider = {
  id: "cash",
  name: "Numerário",
  label: "Numerário",
  description: "Pagamento em dinheiro. Confirmação manual.",
  isAvailable: true,
  requiresExternalApi: false,

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const reference = `CASH-${Date.now().toString(36).toUpperCase()}`;
    return {
      success: true,
      providerReference: reference,
      instructions:
        "Pagamento em numerário. O administrador deve confirmar o recebimento.",
    };
  },
};

const map: Record<string, PaymentProvider> = {
  BANK_TRANSFER: bankTransferProvider,
  bank_transfer: bankTransferProvider,
  MULTICAIXA: multicaixaProvider,
  multicaixa: multicaixaProvider,
  UNITEL_MONEY: unitelMoneyProvider,
  unitel_money: unitelMoneyProvider,
  SANDBOX: sandboxProvider,
  cash: cashProvider,
  other: bankTransferProvider,
};

export function getProvider(method: PaymentMethod): PaymentProvider {
  return map[method] || bankTransferProvider;
}

export function getAvailableProviders(): PaymentProvider[] {
  return [
    sandboxProvider,
    multicaixaProvider,
    unitelMoneyProvider,
    bankTransferProvider,
    cashProvider,
  ];
}

export function listPaymentMethods() {
  return getAvailableProviders();
}
