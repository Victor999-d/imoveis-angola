import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, visitStatusLabels } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteVisitasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const visits = await prisma.visit.findMany({
    where: { clientId: session.user.id },
    include: {
      property: { select: { title: true, neighborhood: true, municipality: true } },
    },
    orderBy: { scheduledDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas visitas</h1>
        <p className="text-muted-foreground">Pedidos e agendamentos</p>
      </div>
      <div className="space-y-3">
        {visits.map((v) => (
          <div key={v.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{v.property.title}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {visitStatusLabels[v.status] || v.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {v.property.neighborhood}, {v.property.municipality} ·{" "}
              {formatDate(v.scheduledDate)} às {v.scheduledTime}
            </p>
          </div>
        ))}
        {visits.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Ainda não pediu visitas. Explore imóveis e solicite uma visita.
          </p>
        )}
      </div>
    </div>
  );
}
