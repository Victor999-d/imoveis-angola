import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const titles: Record<string, string> = {
  negociacoes: "Negociações",
  contratos: "Contratos",
  comissoes: "Comissões",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  visitas: "Visitas",
};

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { section } = await params;
  const title = titles[section] || section;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Módulo em evolução. Os dados e fluxos completos de {title.toLowerCase()} serão
        activados nas próximas iterações.
      </div>
    </div>
  );
}
