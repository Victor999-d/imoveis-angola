"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/actions/properties";

export default function NovoImovelPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await createProperty({
        title: String(fd.get("title") || ""),
        description: String(fd.get("description") || ""),
        type: String(fd.get("type") || "APARTMENT") as any,
        province: String(fd.get("province") || ""),
        municipality: String(fd.get("municipality") || ""),
        neighborhood: String(fd.get("neighborhood") || ""),
        address: String(fd.get("address") || ""),
        monthlyPrice: Number(fd.get("monthlyPrice") || 0),
        bedrooms: Number(fd.get("bedrooms") || 0),
        bathrooms: Number(fd.get("bathrooms") || 0),
        areaSqm: fd.get("areaSqm") ? Number(fd.get("areaSqm")) : null,
        isFurnished: fd.get("isFurnished") === "on",
      });
      if (result?.error) setError(result.error);
      else router.push("/proprietario/imoveis");
    } catch {
      setError("Erro ao criar imóvel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo imóvel</h1>
        <p className="text-muted-foreground">
          Preencha os dados para anunciar (preço em Kz)
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-card p-6">
        <Field label="Título" name="title" required minLength={5} />
        <div className="space-y-1">
          <label className="text-sm font-medium">Descrição</label>
          <textarea
            name="description"
            required
            minLength={20}
            rows={4}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tipo</label>
            <select name="type" className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="APARTMENT">Apartamento</option>
              <option value="HOUSE">Casa</option>
              <option value="VILLA">Vivenda</option>
              <option value="STUDIO">Estúdio</option>
              <option value="COMMERCIAL">Comercial</option>
            </select>
          </div>
          <Field label="Preço mensal (Kz)" name="monthlyPrice" type="number" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Província" name="province" required defaultValue="Luanda" />
          <Field label="Município" name="municipality" required />
          <Field label="Bairro" name="neighborhood" required />
        </div>
        <Field label="Endereço" name="address" required />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Quartos" name="bedrooms" type="number" defaultValue="1" />
          <Field label="Casas de banho" name="bathrooms" type="number" defaultValue="1" />
          <Field label="Área (m²)" name="areaSqm" type="number" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFurnished" className="rounded" />
          Mobilado
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {loading ? "A guardar..." : "Guardar (rascunho / pendente)"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  minLength,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        defaultValue={defaultValue}
        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
