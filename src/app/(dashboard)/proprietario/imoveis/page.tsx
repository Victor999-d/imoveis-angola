import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, propertyStatusLabels } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProprietarioImoveisPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const properties = await prisma.property.findMany({
    where:
      session.user.role === "ADMIN"
        ? {}
        : { ownerId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Meus imóveis</h1>
          <p className="text-muted-foreground">Gerir anúncios de arrendamento</p>
        </div>
        <Link
          href="/proprietario/imoveis/novo"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          + Novo imóvel
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Título</th>
              <th className="p-3 font-medium">Local</th>
              <th className="p-3 font-medium">Preço/mês</th>
              <th className="p-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-muted-foreground">
                  {p.neighborhood}, {p.municipality}
                </td>
                <td className="p-3">{formatCurrency(Number(p.monthlyPrice))}</td>
                <td className="p-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {propertyStatusLabels[p.status] || p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">
            Ainda não tem imóveis. Clique em "Novo imóvel" para anunciar.
          </p>
        )}
      </div>
    </div>
  );
}
