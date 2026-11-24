export type PaymentMethod =
  | "MULTICAIXA"
  | "UNITEL_MONEY"
  | "BANK_TRANSFER"
  | "SANDBOX";

export type PaymentIntentStatus =
  | "PENDING"
  | "AWAITING_CONFIRMATION"
  | "CONFIRMED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export interface CreatePaymentInput {
  amount: number; // AOA
  currency?: "AOA";
  method: PaymentMethod;
  description: string;
  reference?: string; // external business ref (commission id, etc.)
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
}

export interface PaymentIntent {
  id: string;
  provider: PaymentMethod;
  status: PaymentIntentStatus;
  amount: number;
  currency: "AOA";
  description: string;
  reference?: string;
  /** Instruções / código mostrado ao utilizador */
  instructions?: string;
  /** Código EMIS / referência Multicaixa / ID Unitel */
  providerReference?: string;
  /** URL de redireccionamento (se o provider suportar) */
  checkoutUrl?: string;
  expiresAt?: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface PaymentProvider {
  readonly id: PaymentMethod;
  readonly label: string;
  readonly description: string;
  createIntent(input: CreatePaymentInput): Promise<PaymentIntent>;
  verify(providerReference: string): Promise<PaymentIntent>;
}
