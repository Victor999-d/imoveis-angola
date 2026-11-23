"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Home,
  Heart,
  Calendar,
  FileText,
  MessageSquare,
  Wallet,
  Settings,
  Users,
  BarChart3,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ownerLinks = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/proprietario/imoveis", label: "Meus Imóveis", icon: Home },
  { href: "/proprietario/visitas", label: "Visitas", icon: Calendar },
  { href: "/proprietario/negociacoes", label: "Negociações", icon: MessageSquare },
  { href: "/proprietario/contratos", label: "Contratos", icon: FileText },
  { href: "/proprietario/comissoes", label: "Comissões", icon: Wallet },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

const clientLinks = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/explorar", label: "Explorar Imóveis", icon: Home },
  { href: "/cliente/favoritos", label: "Favoritos", icon: Heart },
  { href: "/cliente/visitas", label: "Minhas Visitas", icon: Calendar },
  { href: "/cliente/negociacoes", label: "Negociações", icon: MessageSquare },
  { href: "/cliente/contratos", label: "Contratos", icon: FileText },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

const adminLinks = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/utilizadores", label: "Utilizadores", icon: Users },
  { href: "/admin/imoveis", label: "Imóveis", icon: Home },
  { href: "/admin/visitas", label: "Visitas", icon: Calendar },
  { href: "/admin/negociacoes", label: "Negociações", icon: MessageSquare },
  { href: "/admin/contratos", label: "Contratos", icon: FileText },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();

  const links =
    user.role === "ADMIN"
      ? adminLinks
      : user.role === "OWNER"
      ? ownerLinks
      : clientLinks;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-card lg:block">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="font-bold">
          Imóveis<span className="text-amber-600">Angola</span>
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Terminar sessão
        </button>
      </div>
    </aside>
  );
}
