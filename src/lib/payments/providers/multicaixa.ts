import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentProvider,
} from "../types";

/**
 * Multicaixa Express / EMIS — estrutura pronta para credenciais reais.
 * Variáveis: MULTICAIXA_MERCHANT_ID, MULTICAIXA_API_KEY, MULTICAIXA_API_URL
 */
export const multicaixaProvider: PaymentProvider = {
  id: "MULTICAIXA",
  label: "Multicaixa Express",
  description: "Pagamento via referência Multicaixa / app bancária",

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    const merchantId = process.env.MULTICAIXA_MERCHANT_ID;
    const apiKey = process.env.MULTICAIXA_API_KEY;
    const apiUrl = process.env.MULTICAIXA_API_URL;

    // Sem credenciais → gera referência local legível (fluxo manual / demo)
    if (!merchantId || !apiKey || !apiUrl) {
      const ref = String(Math.floor(100000000 + Math.random() * 900000000));
      return {
        id: `mcx_${ref}`,
        provider: "MULTICAIXA",
        status: "AWAITING_CONFIRMATION",
        amount: input.amount,
        currency: "AOA",
        description: input.description,
        reference: input.reference,
        providerReference: ref,
        instructions: [
          "1. Abra a app do seu banco ou Multicaixa Express",
          `2. Pague a referência: ${ref}`,
          `3. Valor: ${input.amount.toLocaleString("pt-AO")} Kz`,
          "4. Após pagar, clique em «Já paguei» para notificar a plataforma",
          "(Configure MULTICAIXA_* no ambiente para API real.)",
        ].join("\n"),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        metadata: input.metadata,
      };
    }

    // Integração real (placeholder HTTP)
    const res = await fetch(`${apiUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Merchant-Id": merchantId,
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: "AOA",
        description: input.description,
        reference: input.reference,
        customer: {
          name: input.customerName,
          email: input.customerEmail,
          phone: input.customerPhone,
        },
        callbackUrl: input.returnUrl,
      }),
    });

    if (!res.ok) {
      throw new Error(`Multicaixa API error: ${res.status}`);
    }

    const data = (await res.json()) as {
      id: string;
      reference: string;
      status?: string;
    };

    return {
      id: data.id,
      provider: "MULTICAIXA",
      status: "AWAITING_CONFIRMATION",
      amount: input.amount,
      currency: "AOA",
      description: input.description,
      reference: input.reference,
      providerReference: data.reference,
      instructions: `Pague a referência Multicaixa ${data.reference}`,
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
  },

  async verify(providerReference: string): Promise<PaymentIntent> {
    const apiUrl = process.env.MULTICAIXA_API_URL;
    const apiKey = process.env.MULTICAIXA_API_KEY;

    if (!apiUrl || !apiKey) {
      return {
        id: providerReference,
        provider: "MULTICAIXA",
        status: "AWAITING_CONFIRMATION",
        amount: 0,
        currency: "AOA",
        description: "Verificação manual — API não configurada",
        providerReference,
        createdAt: new Date().toISOString(),
      };
    }

    const res = await fetch(`${apiUrl}/payments/${providerReference}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = (await res.json()) as { status: string; amount?: number };
    const status =
      data.status === "PAID" || data.status === "CONFIRMED"
        ? "CONFIRMED"
        : data.status === "FAILED"
        ? "FAILED"
        : "AWAITING_CONFIRMATION";

    return {
      id: providerReference,
      provider: "MULTICAIXA",
      status,
      amount: data.amount || 0,
      currency: "AOA",
      description: "Multicaixa",
      providerReference,
      createdAt: new Date().toISOString(),
    };
  },
};
