import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] || "Utilizador";
  const roleLabel =
    session.user.role === "ADMIN"
      ? "Administrador"
      : session.user.role === "OWNER"
      ? "Proprietário"
      : "Cliente";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Olá, {firstName}
        </h1>
        <p className="text-muted-foreground">{roleLabel} · Painel Imóveis Angola</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Imóveis", "Visitas", "Negociações", "Contratos"].map((label) => (
          <div key={label} className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-bold">—</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold mb-2">Bem-vindo à plataforma</h2>
        <p className="text-sm text-muted-foreground">
          Explore imóveis, gere visitas e acompanhe o seu negócio imobiliário em Angola.
        </p>
      </div>
    </div>
  );
}
