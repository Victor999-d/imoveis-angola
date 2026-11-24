"use client";

import { useState } from "react";
import {
  initiateCustomPayment,
  confirmSandboxPayment,
} from "@/actions/payments";
import type { PaymentIntent, PaymentMethod } from "@/lib/payments";
import { formatCurrency } from "@/lib/utils";

const METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  {
    id: "SANDBOX",
    label: "Sandbox (teste)",
    hint: "Simula pagamento instantâneo",
  },
  {
    id: "MULTICAIXA",
    label: "Multicaixa Express",
    hint: "Referência bancária / app",
  },
  {
    id: "UNITEL_MONEY",
    label: "Unitel Money",
    hint: "Carteira móvel",
  },
  {
    id: "BANK_TRANSFER",
    label: "Transferência bancária",
    hint: "IBAN com confirmação manual",
  },
];

export default function PagamentosPage() {
  const [amount, setAmount] = useState("25000");
  const [method, setMethod] = useState<PaymentMethod>("SANDBOX");
  const [description, setDescription] = useState("Pagamento de teste — comissão");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [intent, setIntent] = useState<PaymentIntent | null>(null);

  async function startPayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setIntent(null);
    try {
      const result = await initiateCustomPayment({
        amount: Number(amount),
        method,
        description,
      });
      if (result.error) setError(result.error);
      else if (result.intent) setIntent(result.intent);
    } catch {
      setError("Falha ao iniciar pagamento");
    } finally {
      setLoading(false);
    }
  }

  async function confirmSandbox() {
    if (!intent?.providerReference) return;
    setLoading(true);
    try {
      const result = await confirmSandboxPayment({
        providerReference: intent.providerReference,
      });
      if (result.intent) setIntent(result.intent);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-muted-foreground">
          Gateway integrado · Multicaixa · Unitel Money · Transferência · Sandbox
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form
        onSubmit={startPayment}
        className="space-y-4 rounded-xl border bg-card p-6"
      >
        <div className="space-y-1">
          <label className="text-sm font-medium">Valor (Kz)</label>
          <input
            type="number"
            min={100}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Descrição</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium">Método</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`rounded-lg border px-3 py-3 text-left text-sm ${
                  method === m.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : ""
                }`}
              >
                <span className="font-medium">{m.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {m.hint}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "A processar..." : "Iniciar pagamento"}
        </button>
      </form>

      {intent && (
        <div className="space-y-3 rounded-xl border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Instruções de pagamento</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                intent.status === "CONFIRMED"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {intent.status === "CONFIRMED" ? "Confirmado" : "Aguardando"}
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(intent.amount)}
          </p>
          <p className="text-sm text-muted-foreground">{intent.description}</p>
          {intent.providerReference && (
            <p className="text-sm">
              <span className="text-muted-foreground">Referência: </span>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                {intent.providerReference}
              </code>
            </p>
          )}
          {intent.instructions && (
            <pre className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm">
              {intent.instructions}
            </pre>
          )}

          {intent.provider === "SANDBOX" && intent.status !== "CONFIRMED" && (
            <button
              type="button"
              onClick={confirmSandbox}
              disabled={loading}
              className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Confirmar pagamento de teste
            </button>
          )}

          {intent.status === "CONFIRMED" && (
            <p className="text-center text-sm font-medium text-green-700">
              Pagamento confirmado com sucesso.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
