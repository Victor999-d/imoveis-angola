import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentMethod,
  PaymentProvider,
} from "./types";
import { sandboxProvider } from "./providers/sandbox";
import { multicaixaProvider } from "./providers/multicaixa";
import { unitelMoneyProvider } from "./providers/unitel-money";
import { bankTransferProvider } from "./providers/bank-transfer";

const providers: Record<PaymentMethod, PaymentProvider> = {
  SANDBOX: sandboxProvider,
  MULTICAIXA: multicaixaProvider,
  UNITEL_MONEY: unitelMoneyProvider,
  BANK_TRANSFER: bankTransferProvider,
};

export function listPaymentMethods(): PaymentProvider[] {
  const allowSandbox =
    process.env.PAYMENTS_SANDBOX !== "false" &&
    process.env.NODE_ENV !== "production";

  // Em produção ainda mostramos sandbox se PAYMENTS_SANDBOX=true
  const forceSandbox = process.env.PAYMENTS_SANDBOX === "true";

  return Object.values(providers).filter((p) => {
    if (p.id === "SANDBOX") return forceSandbox || allowSandbox || true;
    return true;
  });
}

export function getProvider(method: PaymentMethod): PaymentProvider {
  const p = providers[method];
  if (!p) throw new Error(`Método de pagamento não suportado: ${method}`);
  return p;
}

export async function createPaymentIntent(
  input: CreatePaymentInput
): Promise<PaymentIntent> {
  if (!input.amount || input.amount <= 0) {
    throw new Error("Valor inválido");
  }
  const provider = getProvider(input.method);
  return provider.createIntent({
    ...input,
    currency: "AOA",
  });
}

export async function verifyPayment(
  method: PaymentMethod,
  providerReference: string
): Promise<PaymentIntent> {
  return getProvider(method).verify(providerReference);
}

export type { CreatePaymentInput, PaymentIntent, PaymentMethod, PaymentProvider };
export { providers };
