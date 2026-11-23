import Link from "next/link";
import { Building2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            Imóveis<span className="text-amber-600">Angola</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/explorar"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Explorar
            </Link>
            <Link
              href="/login"
              className="rounded-lg border px-3 py-1.5 text-sm font-medium"
            >
              Entrar
            </Link>
            <Link
              href="/registo"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
            >
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-20 text-center text-white">
          <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
            Encontre o imóvel ideal em Angola
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Plataforma moderna de arrendamento. Proprietários anunciam. Clientes
            encontram. Tudo em Kwanza (AOA).
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/explorar"
              className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-900"
            >
              Explorar imóveis
            </Link>
            <Link
              href="/registo"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold"
            >
              Anunciar imóvel
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold">Como funciona</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Anuncie",
                text: "Proprietários cadastram imóveis com fotos e condições de arrendamento.",
              },
              {
                title: "Explore",
                text: "Clientes pesquisam por província, preço e tipo de imóvel em Kwanza.",
              },
              {
                title: "Feche negócio",
                text: "Visitas, negociação e contratos geridos na plataforma.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border p-6">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Imóveis Angola · Mercado angolano · AOA
      </footer>
    </div>
  );
}
