import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, visitStatusLabels } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProprietarioVisitasPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const visits = await prisma.visit.findMany({
    where: {
      property: {
        ownerId: session.user.role === "ADMIN" ? undefined : session.user.id,
      },
    },
    include: {
      property: { select: { title: true } },
      client: { select: { name: true, phone: true } },
    },
    orderBy: { scheduledDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visitas</h1>
        <p className="text-muted-foreground">Pedidos aos seus imóveis</p>
      </div>
      <div className="space-y-3">
        {visits.map((v) => (
          <div key={v.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium">{v.property.title}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                {visitStatusLabels[v.status] || v.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Cliente: {v.client.name}
              {v.client.phone ? ` · ${v.client.phone}` : ""} ·{" "}
              {formatDate(v.scheduledDate)} às {v.scheduledTime}
            </p>
          </div>
        ))}
        {visits.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Sem pedidos de visita por agora.
          </p>
        )}
      </div>
    </div>
  );
}
