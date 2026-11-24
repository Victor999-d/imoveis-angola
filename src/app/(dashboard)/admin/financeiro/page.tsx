import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { markPaymentPaidManual } from "@/actions/payments";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminFinanceiroPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const [commissions, payments] = await Promise.all([
    prisma.commission.findMany({
      include: { deal: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const pending = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((s, c) => s + Number(c.calculatedAmount), 0);
  const paid = commissions
    .filter((c) => c.status === "PAID")
    .reduce((s, c) => s + Number(c.calculatedAmount), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Comissões e pagamentos (gateway Multicaixa / Unitel / transferência)
          </p>
        </div>
        <Link
          href="/pagamentos"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Novo pagamento
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Comissões pendentes</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(pending)}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Comissões pagas</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {formatCurrency(paid)}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">Pagamentos recentes</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Data</th>
                <th className="p-3">Método</th>
                <th className="p-3">Referência</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acção</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{formatDate(p.createdAt)}</td>
                  <td className="p-3">{p.method || "—"}</td>
                  <td className="p-3 font-mono text-xs">{p.reference || "—"}</td>
                  <td className="p-3">{formatCurrency(Number(p.amount))}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">
                    {p.status === "PENDING" && (
                      <form action={markPaymentPaidManual.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                        >
                          Confirmar
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <p className="p-6 text-center text-muted-foreground">
              Ainda sem pagamentos. Use «Novo pagamento» ou o fluxo de comissões.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
