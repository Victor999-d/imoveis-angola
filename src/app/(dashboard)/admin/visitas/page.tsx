import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, visitStatusLabels } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminVisitasPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const visits = await prisma.visit.findMany({
    include: {
      property: { select: { title: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Visitas (admin)</h1>
      <div className="space-y-3">
        {visits.map((v) => (
          <div key={v.id} className="rounded-xl border p-4">
            <p className="font-medium">{v.property.title}</p>
            <p className="text-sm text-muted-foreground">
              {v.client.name} · {formatDate(v.scheduledDate)} {v.scheduledTime} ·{" "}
              {visitStatusLabels[v.status] || v.status}
            </p>
          </div>
        ))}
        {visits.length === 0 && (
          <p className="text-muted-foreground">Sem visitas registadas.</p>
        )}
      </div>
    </div>
  );
}
