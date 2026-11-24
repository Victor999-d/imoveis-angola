import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentProvider,
} from "../types";

export const multicaixaProvider: PaymentProvider = {
  id: "MULTICAIXA",
  label: "Multicaixa Express",
  description: "Pagamento via referência Multicaixa / app bancária",

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    const ref = String(Math.floor(100000000 + Math.random() * 900000000));
    return {
      id: `mcx_${ref}`,
      provider: "MULTICAIXA",
      status: "AWAITING_CONFIRMATION",
      amount: input.amount,
      currency: "AOA",
      description: input.description || "Multicaixa Express",
      reference: input.reference,
      providerReference: ref,
      instructions: [
        "1. Abra a app do seu banco ou Multicaixa Express",
        `2. Pague a referência: ${ref}`,
        `3. Valor: ${input.amount.toLocaleString("pt-AO")} Kz`,
        "4. Após pagar, clique em «Já paguei» para notificar a plataforma",
      ].join("\n"),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
  },

  async verify(providerReference: string): Promise<PaymentIntent> {
    return {
      id: providerReference,
      provider: "MULTICAIXA",
      status: "AWAITING_CONFIRMATION",
      amount: 0,
      currency: "AOA",
      description: "Multicaixa",
      providerReference,
      createdAt: new Date().toISOString(),
    };
  },
};
