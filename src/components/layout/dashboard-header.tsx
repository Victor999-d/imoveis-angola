"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  name: string;
  email: string;
  role: string;
}

const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  OWNER: "Proprietário",
  CLIENT: "Cliente",
};

export function DashboardHeader({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {roleLabels[user.role] || user.role}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  );
}
