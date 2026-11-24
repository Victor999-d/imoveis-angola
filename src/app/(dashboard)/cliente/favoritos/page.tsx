import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FavoritosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { property: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Favoritos</h1>
        <p className="text-muted-foreground">Imóveis que guardou</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {favorites.map((f) => (
          <Link
            key={f.id}
            href={`/imovel/${f.property.slug}`}
            className="rounded-xl border bg-card p-4 hover:shadow-sm"
          >
            <p className="font-medium">{f.property.title}</p>
            <p className="text-sm text-primary">
              {formatCurrency(Number(f.property.monthlyPrice))}/mês
            </p>
            <p className="text-xs text-muted-foreground">
              {f.property.neighborhood}, {f.property.municipality}
            </p>
          </Link>
        ))}
      </div>
      {favorites.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Ainda sem favoritos.{" "}
          <Link href="/explorar" className="text-primary underline">
            Explorar imóveis
          </Link>
        </p>
      )}
    </div>
  );
}
