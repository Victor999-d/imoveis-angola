import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentMethod,
  PaymentProvider,
} from "./types";
import { getProvider, getAvailableProviders } from "./providers";

export function listPaymentMethods(): PaymentProvider[] {
  return getAvailableProviders();
}

export { getProvider, getAvailableProviders };

export async function createPaymentIntent(
  input: CreatePaymentInput
): Promise<PaymentIntent> {
  if (!input.amount || input.amount <= 0) {
    throw new Error("Valor inválido");
  }
  const provider = getProvider(input.method);
  if (provider.createPayment) {
    const result = await provider.createPayment({
      ...input,
      currency: "AOA",
    });
    if (!result.success) {
      throw new Error(result.error || "Falha no provider");
    }
    return {
      id: result.providerReference || `pay_${Date.now()}`,
      provider: input.method,
      status: "AWAITING_CONFIRMATION",
      amount: input.amount,
      currency: "AOA",
      description: input.description || "Pagamento",
      reference: input.reference,
      providerReference: result.providerReference,
      instructions: result.instructions,
      createdAt: new Date().toISOString(),
      metadata: input.metadata,
    };
  }
  throw new Error("Provider sem createPayment");
}

export async function verifyPayment(
  method: PaymentMethod,
  providerReference: string
): Promise<PaymentIntent> {
  if (method === "SANDBOX") {
    return {
      id: providerReference,
      provider: "SANDBOX",
      status: "CONFIRMED",
      amount: 0,
      currency: "AOA",
      description: "Sandbox",
      providerReference,
      createdAt: new Date().toISOString(),
    };
  }
  return {
    id: providerReference,
    provider: method,
    status: "AWAITING_CONFIRMATION",
    amount: 0,
    currency: "AOA",
    description: "Aguardando confirmação",
    providerReference,
    createdAt: new Date().toISOString(),
  };
}

export type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentMethod,
  PaymentProvider,
  PaymentResult,
} from "./types";
