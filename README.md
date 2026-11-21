# Imóveis Angola

Plataforma digital completa de gestão e arrendamento de imóveis para o mercado angolano.

## Stack tecnológica

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Estilo**: Tailwind CSS 4 + shadcn/ui + Lucide Icons
- **Backend**: Next.js API Routes + Server Actions
- **Base de dados**: PostgreSQL + Prisma ORM
- **Autenticação**: Auth.js (NextAuth v5) com Credentials
- **Validação**: Zod + React Hook Form
- **Gráficos**: Recharts
- **Mapas**: Leaflet + OpenStreetMap
- **PDF**: jsPDF

## Perfis de utilizador

| Perfil | Descrição |
|--------|-----------|
| **Administrador** | Controlo total da plataforma |
| **Proprietário** | Cadastra e gere imóveis |
| **Cliente** | Pesquisa e solicita visitas |

## Funcionalidades principais

- Cadastro e verificação de imóveis
- Pesquisa avançada com filtros e mapa
- Sistema de visitas e transporte
- Negociação e contratos
- Gestão de comissões e financeiro
- Notificações internas
- Dashboards por perfil
- Modo claro / escuro
- Totalmente responsivo

## Configuração local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm ou pnpm

### Instalação

```bash
# 1. Entrar no projecto
cd imoveis-angola

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a DATABASE_URL e AUTH_SECRET

# 4. Gerar cliente Prisma e aplicar schema
npx prisma generate
npx prisma db push

# 5. (Opcional) Popular dados de demonstração
npm run db:seed

# 6. Iniciar em desenvolvimento
npm run dev
```

A aplicação estará disponível em http://localhost:3000

### Gerar AUTH_SECRET

```bash
openssl rand -base64 32
```

## Estrutura do projecto

```
src/
├── app/                    # App Router
│   ├── (auth)/             # Login, registo
│   ├── (public)/           # Páginas públicas
│   ├── (dashboard)/        # Painéis por perfil
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # Componentes base
│   ├── layout/             # Header, sidebar
│   ├── properties/         # Imóveis
│   └── dashboard/          # Painéis
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── utils.ts
│   └── validations.ts
prisma/
└── schema.prisma
```

## Moeda e localização

- Idioma: Português de Angola (pt-AO)
- Moeda: Kwanza (AOA) — formato 250.000 Kz
- Fuso horário: Africa/Luanda

## Segurança

- Palavras-passe com bcrypt
- RBAC (Role-Based Access Control)
- Protecção de rotas
- Validação frontend + backend
- Documentos privados controlados
- Registo de actividades

## Licença

Projecto privado. Todos os direitos reservados.
