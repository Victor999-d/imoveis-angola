import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function ModuleStub({
  title,
  role,
}: {
  title: string;
  role?: string;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        Módulo de {title.toLowerCase()}
        {role ? ` (${role})` : ""} preparado na plataforma. Fluxos avançados
        (propostas, assinatura e pagamentos) serão ligados nas próximas versões.
      </div>
    </div>
  );
}
