import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentProvider,
} from "../types";

export const bankTransferProvider: PaymentProvider = {
  id: "BANK_TRANSFER",
  label: "Transferência bancária",
  description: "IBAN / depósito bancário com confirmação manual",

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    const iban = process.env.BANK_IBAN || "AO06 0000 0000 0000 0000 0000 0";
    const bankName = process.env.BANK_NAME || "Banco (configurar BANK_NAME)";
    const accountName =
      process.env.BANK_ACCOUNT_NAME || "Imóveis Angola, Lda";
    const ref = `TB-${Date.now().toString(36).toUpperCase()}`;

    return {
      id: `bank_${ref}`,
      provider: "BANK_TRANSFER",
      status: "AWAITING_CONFIRMATION",
      amount: input.amount,
      currency: "AOA",
      description: input.description || "Transferência bancária",
      reference: input.reference,
      providerReference: ref,
      instructions: [
        `Banco: ${bankName}`,
        `Titular: ${accountName}`,
        `IBAN: ${iban}`,
        `Valor: ${input.amount.toLocaleString("pt-AO")} Kz`,
        `Referência / descrição: ${ref}`,
        "Após transferir, clique em «Já paguei». A equipa confirma o crédito.",
      ].join("\n"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
  },

  async verify(): Promise<PaymentIntent> {
    return {
      id: "bank",
      provider: "BANK_TRANSFER",
      status: "AWAITING_CONFIRMATION",
      amount: 0,
      currency: "AOA",
      description: "Transferência — confirmação manual pelo admin",
      createdAt: new Date().toISOString(),
    };
  },
};
