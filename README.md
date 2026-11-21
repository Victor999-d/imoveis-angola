# Imóveis Angola

Plataforma digital de gestão e arrendamento de imóveis para o mercado angolano.

**Repositório:** https://github.com/Victor999-d/imoveis-angola

## Estado actual (MVP)

| Funcionalidade | Estado |
|----------------|--------|
| Schema Prisma completo | ✅ |
| Autenticação (login/registo) | ✅ |
| Middleware + RBAC | ✅ |
| Homepage moderna | ✅ |
| Página Explorar Imóveis | ✅ |
| Dashboard por perfil | ✅ |
| Sidebar + Header | ✅ |
| Formatação Kwanza + pt-AO | ✅ |
| Módulos avançados (visitas, contratos, financeiro...) | 🔜 Próximos |

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui + Lucide
- PostgreSQL + Prisma
- Auth.js (NextAuth v5)
- Zod + React Hook Form

## Como correr localmente

```bash
git clone https://github.com/Victor999-d/imoveis-angola.git
cd imoveis-angola
npm install

cp .env.example .env
# Edite .env:
# DATABASE_URL="postgresql://..."
# AUTH_SECRET="$(openssl rand -base64 32)"

npx prisma generate
npx prisma db push

npm run dev
```

Abra http://localhost:3000

## Deploy no Vercel

1. Importe o repositório no [Vercel](https://vercel.com/new)
2. Adicione as variáveis de ambiente:
   - `DATABASE_URL` (use Neon, Supabase ou Railway)
   - `AUTH_SECRET`
   - `AUTH_URL` / `NEXTAUTH_URL` (URL do deploy)
3. Deploy

**Base de dados recomendada (gratuita):**
- [Neon](https://neon.tech) ou [Supabase](https://supabase.com)

## Estrutura

```
src/
├── app/
│   ├── (auth)/          # Login, Registo
│   ├── (dashboard)/     # Painéis protegidos
│   ├── (public)/        # Explorar, etc.
│   └── api/auth/        # NextAuth
├── components/
│   ├── ui/
│   └── layout/
├── lib/                 # auth, prisma, utils, validations
├── actions/             # Server Actions
└── middleware.ts
```

## Perfis

- **ADMIN** – Controlo total
- **OWNER** – Proprietário (imóveis, visitas, comissões)
- **CLIENT** – Cliente (pesquisa, visitas, favoritos)

## Próximos passos

1. CRUD completo de imóveis + upload de fotos
2. Sistema de visitas e transporte
3. Negociação e contratos PDF
4. Módulo financeiro e comissões
5. Notificações e relatórios

---

Feito com ❤️ para o mercado angolano.
