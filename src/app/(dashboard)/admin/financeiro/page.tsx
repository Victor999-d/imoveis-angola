import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export default async function FinanceiroPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">
          Visão geral de comissões e pagamentos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Comissões (mês)</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(0)}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Pagamentos pendentes</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(0)}</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <p className="text-sm text-muted-foreground">Recebido</p>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(0)}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p className="text-muted-foreground text-sm">
          Os dados financeiros aparecerão aqui após a configuração completa da base de dados e registo de negócios.
        </p>
      </div>
    </div>
  );
}
