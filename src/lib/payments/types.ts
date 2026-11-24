export type PaymentMethod =
  | "MULTICAIXA"
  | "UNITEL_MONEY"
  | "BANK_TRANSFER"
  | "SANDBOX"
  | "bank_transfer"
  | "multicaixa"
  | "unitel_money"
  | "cash"
  | "other";

export type PaymentIntentStatus =
  | "PENDING"
  | "AWAITING_CONFIRMATION"
  | "CONFIRMED"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED";

export interface CreatePaymentInput {
  amount: number;
  currency?: "AOA";
  method: PaymentMethod;
  description?: string;
  reference?: string;
  commissionId?: string;
  notes?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  providerReference?: string;
  instructions?: string;
  paymentId?: string;
}

export interface PaymentIntent {
  id: string;
  provider: PaymentMethod;
  status: PaymentIntentStatus;
  amount: number;
  currency: "AOA";
  description: string;
  reference?: string;
  instructions?: string;
  providerReference?: string;
  checkoutUrl?: string;
  expiresAt?: string;
  createdAt: string;
  metadata?: Record<string, string>;
}

export interface PaymentProvider {
  readonly id: PaymentMethod;
  readonly label?: string;
  readonly name?: string;
  readonly description: string;
  readonly isAvailable?: boolean;
  readonly requiresExternalApi?: boolean;
  createIntent?(input: CreatePaymentInput): Promise<PaymentIntent>;
  createPayment?(input: CreatePaymentInput): Promise<PaymentResult>;
  verify?(providerReference: string): Promise<PaymentIntent>;
}
