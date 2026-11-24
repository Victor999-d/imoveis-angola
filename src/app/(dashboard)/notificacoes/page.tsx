import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificacoesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notificações</h1>
        <p className="text-muted-foreground">Actualizações da sua conta</p>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-xl border p-4 ${n.isRead ? "opacity-70" : "bg-card"}`}
          >
            <p className="font-medium">{n.title}</p>
            <p className="text-sm text-muted-foreground">{n.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDateTime(n.createdAt)}
            </p>
          </div>
        ))}
        {notifications.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Sem notificações.
          </p>
        )}
      </div>
    </div>
  );
}
