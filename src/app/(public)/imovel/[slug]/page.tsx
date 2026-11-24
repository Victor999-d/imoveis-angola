import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Bed, Bath, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, propertyTypeLabels } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ImovelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      owner: { select: { name: true, phone: true } },
    },
  });

  if (!property || property.status !== "PUBLISHED") notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            Imóveis<span className="text-amber-600">Angola</span>
          </Link>
          <Link href="/explorar" className="flex items-center gap-1 text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar à pesquisa
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex h-64 items-center justify-center rounded-xl bg-muted md:h-96">
              {property.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.images[0].url}
                  alt={property.title}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <Building2 className="h-16 w-16 opacity-30" />
              )}
            </div>
            <h1 className="text-2xl font-bold">{property.title}</h1>
            <p className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.neighborhood}, {property.municipality},{" "}
              {property.province}
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="rounded-full bg-muted px-3 py-1">
                {propertyTypeLabels[property.type] || property.type}
              </span>
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" /> {property.bedrooms} quartos
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4" /> {property.bathrooms} casas de banho
              </span>
              {property.areaSqm && <span>{property.areaSqm} m²</span>}
              {property.isFurnished && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                  Mobilado
                </span>
              )}
            </div>
            <div className="prose max-w-none">
              <h2 className="text-lg font-semibold">Descrição</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {property.description}
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border bg-card p-6 sticky top-6">
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(Number(property.monthlyPrice))}
              </p>
              <p className="text-sm text-muted-foreground">por mês</p>
              <Link
                href="/login"
                className="mt-6 block w-full rounded-lg bg-primary py-3 text-center text-sm font-semibold text-primary-foreground"
              >
                Solicitar visita
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Inicie sessão para pedir visita ou negociar
              </p>
              <div className="mt-6 border-t pt-4 text-sm">
                <p className="font-medium">Anunciante</p>
                <p className="text-muted-foreground">{property.owner.name}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
