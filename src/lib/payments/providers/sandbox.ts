import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentProvider,
} from "../types";

const store = new Map<string, PaymentIntent>();

function uid() {
  return `sbx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const sandboxProvider: PaymentProvider = {
  id: "SANDBOX",
  label: "Sandbox (teste)",
  description: "Simula pagamentos sem gateway real — ideal para desenvolvimento",

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    const id = uid();
    const intent: PaymentIntent = {
      id,
      provider: "SANDBOX",
      status: "AWAITING_CONFIRMATION",
      amount: input.amount,
      currency: "AOA",
      description: input.description,
      reference: input.reference,
      providerReference: id,
      instructions:
        "Modo sandbox: clique em «Confirmar pagamento de teste» para simular sucesso.",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
    store.set(id, intent);
    return intent;
  },

  async verify(providerReference: string): Promise<PaymentIntent> {
    const existing = store.get(providerReference);
    if (!existing) {
      return {
        id: providerReference,
        provider: "SANDBOX",
        status: "FAILED",
        amount: 0,
        currency: "AOA",
        description: "Intent não encontrado",
        createdAt: new Date().toISOString(),
      };
    }
    const confirmed: PaymentIntent = {
      ...existing,
      status: "CONFIRMED",
    };
    store.set(providerReference, confirmed);
    return confirmed;
  },
};
