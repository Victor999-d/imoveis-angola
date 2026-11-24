import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] || "Utilizador";
  const role = session.user.role;
  const roleLabel =
    role === "ADMIN"
      ? "Administrador"
      : role === "OWNER"
      ? "Proprietário"
      : "Cliente";

  let stats = [
    { label: "Imóveis", value: "—", href: "/explorar" },
    { label: "Visitas", value: "—", href: "/cliente/visitas" },
    { label: "Notificações", value: "—", href: "/notificacoes" },
    { label: "Favoritos", value: "—", href: "/cliente/favoritos" },
  ];

  try {
    if (role === "ADMIN") {
      const [users, props, visits, pending] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.visit.count(),
        prisma.property.count({ where: { status: "PENDING_VERIFICATION" } }),
      ]);
      stats = [
        { label: "Utilizadores", value: String(users), href: "/admin/utilizadores" },
        { label: "Imóveis", value: String(props), href: "/admin/imoveis" },
        { label: "Pendentes", value: String(pending), href: "/admin/imoveis" },
        { label: "Visitas", value: String(visits), href: "/admin/visitas" },
      ];
    } else if (role === "OWNER") {
      const [props, visits, notifs] = await Promise.all([
        prisma.property.count({ where: { ownerId: session.user.id } }),
        prisma.visit.count({ where: { property: { ownerId: session.user.id } } }),
        prisma.notification.count({
          where: { userId: session.user.id, isRead: false },
        }),
      ]);
      stats = [
        { label: "Meus imóveis", value: String(props), href: "/proprietario/imoveis" },
        { label: "Visitas", value: String(visits), href: "/proprietario/visitas" },
        { label: "Não lidas", value: String(notifs), href: "/notificacoes" },
        { label: "Novo anúncio", value: "+", href: "/proprietario/imoveis/novo" },
      ];
    } else {
      const [favs, visits, notifs] = await Promise.all([
        prisma.favorite.count({ where: { userId: session.user.id } }),
        prisma.visit.count({ where: { clientId: session.user.id } }),
        prisma.notification.count({
          where: { userId: session.user.id, isRead: false },
        }),
      ]);
      stats = [
        { label: "Favoritos", value: String(favs), href: "/cliente/favoritos" },
        { label: "Visitas", value: String(visits), href: "/cliente/visitas" },
        { label: "Não lidas", value: String(notifs), href: "/notificacoes" },
        { label: "Explorar", value: "→", href: "/explorar" },
      ];
    }
  } catch {
    /* DB may be temporarily unavailable */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {firstName}</h1>
        <p className="text-muted-foreground">
          {roleLabel} · Painel Imóveis Angola
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border bg-card p-6 transition hover:shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-2 font-semibold">Atalhos</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link href="/explorar" className="rounded-lg border px-3 py-1.5">
            Explorar imóveis
          </Link>
          {(role === "OWNER" || role === "ADMIN") && (
            <Link
              href="/proprietario/imoveis/novo"
              className="rounded-lg border px-3 py-1.5"
            >
              Anunciar imóvel
            </Link>
          )}
          <Link href="/notificacoes" className="rounded-lg border px-3 py-1.5">
            Notificações
          </Link>
        </div>
      </div>
    </div>
  );
}
