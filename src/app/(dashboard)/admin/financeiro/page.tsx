import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listPaymentMethods } from "@/lib/payments/service";
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFinanceiroPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [pending, paid, overdue, recentPayments, methods] = await Promise.all([
    prisma.commission.aggregate({
      where: { status: "PENDING" },
      _sum: { calculatedAmount: true },
      _count: true,
    }),
    prisma.commission.aggregate({
      where: { status: "PAID" },
      _sum: { calculatedAmount: true },
      _count: true,
    }),
    prisma.commission.aggregate({
      where: { status: "OVERDUE" },
      _sum: { calculatedAmount: true },
      _count: true,
    }),
    prisma.payment
      .findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { commission: { include: { deal: true } } },
      })
      .catch(() => []),
    Promise.resolve(listPaymentMethods()),
  ]);

  const statusLabel: Record<string, string> = {
    PENDING: "Pendente",
    CONFIRMED: "Confirmado",
    FAILED: "Falhou",
    REFUNDED: "Reembolsado",
  };

  const methodLabel: Record<string, string> = {
    bank_transfer: "Transferência",
    multicaixa: "Multicaixa",
    unitel_money: "Unitel Money",
    cash: "Numerário",
    other: "Outro",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestão Financeira</h1>
        <p className="text-muted-foreground">
          Comissões, pagamentos e métodos disponíveis
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Comissões pendentes</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(Number(pending._sum.calculatedAmount || 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {pending._count} registo(s)
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Comissões pagas</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(Number(paid._sum.calculatedAmount || 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {paid._count} registo(s)
              </p>
            </div>
            <div className="rounded-xl bg-green-500/10 p-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em atraso</p>
              <p className="mt-1 text-2xl font-bold">
                {formatCurrency(Number(overdue._sum.calculatedAmount || 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {overdue._count} registo(s)
              </p>
            </div>
            <div className="rounded-xl bg-red-500/10 p-3 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Métodos de pagamento configurados
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m) => (
            <div key={m.id} className="rounded-xl border p-4 space-y-1">
              <p className="font-medium text-sm">{m.name}</p>
              <p className="text-xs text-muted-foreground">{m.description}</p>
              {m.requiresExternalApi && (
                <span className="inline-block text-[10px] uppercase tracking-wide bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded">
                  Requer API
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Para activar Multicaixa ou Unitel Money, configure as variáveis de
          ambiente correspondentes (ver .env.example).
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Pagamentos recentes
        </h2>

        {recentPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Ainda não existem pagamentos registados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Referência</th>
                  <th className="pb-3 font-medium">Método</th>
                  <th className="pb-3 font-medium">Valor</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">
                      {p.reference || p.id.slice(-8)}
                    </td>
                    <td className="py-3">
                      {methodLabel[p.method || ""] || p.method || "—"}
                    </td>
                    <td className="py-3 font-medium">
                      {formatCurrency(Number(p.amount))}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          p.status === "CONFIRMED"
                            ? "bg-green-500/10 text-green-700"
                            : p.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-700"
                            : "bg-red-500/10 text-red-700"
                        }`}
                      >
                        {statusLabel[p.status] || p.status}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
