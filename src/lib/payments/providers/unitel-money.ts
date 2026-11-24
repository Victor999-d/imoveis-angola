import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentProvider,
} from "../types";

/**
 * Unitel Money — estrutura para API comercial.
 * Variáveis: UNITEL_MONEY_API_KEY, UNITEL_MONEY_MERCHANT_CODE, UNITEL_MONEY_API_URL
 */
export const unitelMoneyProvider: PaymentProvider = {
  id: "UNITEL_MONEY",
  label: "Unitel Money",
  description: "Pagamento móvel Unitel Money",

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    const apiKey = process.env.UNITEL_MONEY_API_KEY;
    const merchant = process.env.UNITEL_MONEY_MERCHANT_CODE;
    const apiUrl = process.env.UNITEL_MONEY_API_URL;

    const localId = `utm_${Date.now().toString(36)}`;

    if (!apiKey || !merchant || !apiUrl) {
      return {
        id: localId,
        provider: "UNITEL_MONEY",
        status: "AWAITING_CONFIRMATION",
        amount: input.amount,
        currency: "AOA",
        description: input.description,
        reference: input.reference,
        providerReference: localId,
        instructions: [
          "1. Abra a app Unitel Money",
          `2. Transfira ${input.amount.toLocaleString("pt-AO")} Kz para o comerciante configurado`,
          `3. Use a referência: ${localId}`,
          "4. Depois clique em «Já paguei»",
          "(Configure UNITEL_MONEY_* para API automática.)",
        ].join("\n"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        metadata: input.metadata,
      };
    }

    const res = await fetch(`${apiUrl}/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        merchantCode: merchant,
        amount: input.amount,
        currency: "AOA",
        msisdn: input.customerPhone,
        description: input.description,
        externalId: input.reference || localId,
      }),
    });

    if (!res.ok) throw new Error(`Unitel Money API error: ${res.status}`);
    const data = (await res.json()) as { transactionId: string };

    return {
      id: data.transactionId,
      provider: "UNITEL_MONEY",
      status: "AWAITING_CONFIRMATION",
      amount: input.amount,
      currency: "AOA",
      description: input.description,
      reference: input.reference,
      providerReference: data.transactionId,
      instructions: "Confirme o pagamento no telemóvel (pedido Unitel Money).",
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
  },

  async verify(providerReference: string): Promise<PaymentIntent> {
    return {
      id: providerReference,
      provider: "UNITEL_MONEY",
      status: process.env.UNITEL_MONEY_API_KEY
        ? "AWAITING_CONFIRMATION"
        : "AWAITING_CONFIRMATION",
      amount: 0,
      currency: "AOA",
      description: "Unitel Money",
      providerReference,
      createdAt: new Date().toISOString(),
    };
  },
};
