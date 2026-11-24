import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, propertyStatusLabels } from "@/lib/utils";
import { approveProperty, rejectProperty } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminImoveisPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const properties = await prisma.property.findMany({
    include: { owner: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Imóveis</h1>
        <p className="text-muted-foreground">Aprovar, rejeitar e gerir anúncios</p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3">Título</th>
              <th className="p-3">Proprietário</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Acções</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-muted-foreground">{p.owner.name}</td>
                <td className="p-3">{formatCurrency(Number(p.monthlyPrice))}</td>
                <td className="p-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {propertyStatusLabels[p.status] || p.status}
                  </span>
                </td>
                <td className="p-3">
                  {p.status === "PENDING_VERIFICATION" && (
                    <div className="flex gap-2">
                      <form action={approveProperty.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="rounded bg-green-600 px-2 py-1 text-xs text-white"
                        >
                          Aprovar
                        </button>
                      </form>
                      <form action={rejectProperty.bind(null, p.id)}>
                        <button
                          type="submit"
                          className="rounded bg-red-600 px-2 py-1 text-xs text-white"
                        >
                          Rejeitar
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {properties.length === 0 && (
          <p className="p-8 text-center text-muted-foreground">Sem imóveis.</p>
        )}
      </div>
    </div>
  );
}
