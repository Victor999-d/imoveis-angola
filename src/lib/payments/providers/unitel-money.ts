import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentProvider,
} from "../types";

export const unitelMoneyProvider: PaymentProvider = {
  id: "UNITEL_MONEY",
  label: "Unitel Money",
  description: "Pagamento móvel Unitel Money",

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    const localId = `utm_${Date.now().toString(36)}`;
    return {
      id: localId,
      provider: "UNITEL_MONEY",
      status: "AWAITING_CONFIRMATION",
      amount: input.amount,
      currency: "AOA",
      description: input.description || "Unitel Money",
      reference: input.reference,
      providerReference: localId,
      instructions: [
        "1. Abra a app Unitel Money",
        `2. Transfira ${input.amount.toLocaleString("pt-AO")} Kz`,
        `3. Use a referência: ${localId}`,
        "4. Depois clique em «Já paguei»",
      ].join("\n"),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
  },

  async verify(providerReference: string): Promise<PaymentIntent> {
    return {
      id: providerReference,
      provider: "UNITEL_MONEY",
      status: "AWAITING_CONFIRMATION",
      amount: 0,
      currency: "AOA",
      description: "Unitel Money",
      providerReference,
      createdAt: new Date().toISOString(),
    };
  },
};
