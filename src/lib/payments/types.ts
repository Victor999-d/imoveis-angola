/**
 * Arquitectura de pagamentos - Imóveis Angola
 * Preparada para integração com serviços disponíveis em Angola.
 *
 * Métodos suportados (preparados):
 * - bank_transfer  → Transferência bancária (confirmação manual)
 * - multicaixa     → Referência Multicaixa Express (quando API disponível)
 * - unitel_money   → Unitel Money (quando API disponível)
 * - cash           → Pagamento em numerário (registo manual)
 */

export type PaymentMethod =
  | "bank_transfer"
  | "multicaixa"
  | "unitel_money"
  | "cash"
  | "other";

export type PaymentProviderStatus = "pending" | "processing" | "confirmed" | "failed" | "cancelled";

export interface CreatePaymentInput {
  commissionId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  payerName?: string;
  payerPhone?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  providerReference?: string;
  instructions?: string;
  error?: string;
}

export interface PaymentProvider {
  id: PaymentMethod;
  name: string;
  description: string;
  isAvailable: boolean;
  requiresExternalApi: boolean;
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  checkStatus?(providerReference: string): Promise<PaymentProviderStatus>;
}
