import Link from "next/link";
import { Building2, MapPin, Bed, Bath, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; provincia?: string; tipo?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const provincia = sp.provincia?.trim();
  const tipo = sp.tipo?.trim();

  const properties = await prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { neighborhood: { contains: q, mode: "insensitive" } },
              { municipality: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(provincia ? { province: { equals: provincia, mode: "insensitive" } } : {}),
      ...(tipo ? { type: tipo as any } : {}),
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      owner: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 48,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            Imóveis<span className="text-amber-600">Angola</span>
          </Link>
          <nav className="flex gap-3 text-sm">
            <Link href="/login" className="rounded-lg border px-3 py-1.5">
              Entrar
            </Link>
            <Link
              href="/registo"
              className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Explorar imóveis</h1>
        <p className="mt-1 text-muted-foreground">
          Encontre o imóvel ideal em Angola · Preços em Kwanza (AOA)
        </p>

        <form className="mt-6 flex flex-wrap gap-2" method="get">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q || ""}
              placeholder="Bairro, município ou título..."
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <select
            name="provincia"
            defaultValue={provincia || ""}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todas as províncias</option>
            {["Luanda", "Benguela", "Huíla", "Cabinda", "Huambo", "Malanje"].map(
              (p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              )
            )}
          </select>
          <select
            name="tipo"
            defaultValue={tipo || ""}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Todos os tipos</option>
            <option value="APARTMENT">Apartamento</option>
            <option value="HOUSE">Casa</option>
            <option value="VILLA">Vivenda</option>
            <option value="STUDIO">Estúdio</option>
            <option value="COMMERCIAL">Comercial</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Pesquisar
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          {properties.length} imóvel(is) encontrado(s)
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/imovel/${p.slug}`}
              className="overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
            >
              <div className="flex h-40 items-center justify-center bg-muted text-muted-foreground">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.images[0].url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-12 w-12 opacity-40" />
                )}
              </div>
              <div className="p-4">
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(Number(p.monthlyPrice))}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}/mês
                  </span>
                </p>
                <h2 className="mt-1 line-clamp-1 font-semibold">{p.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.neighborhood}, {p.municipality}
                </p>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" /> {p.bedrooms} quartos
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" /> {p.bathrooms} WC
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            Nenhum imóvel publicado ainda. Os proprietários podem anunciar a partir do painel.
          </div>
        )}
      </main>
    </div>
  );
}
