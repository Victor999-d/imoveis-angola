# Gateway de pagamentos — Imóveis Angola

## Métodos suportados

| Método | Código | Notas |
|--------|--------|--------|
| Sandbox | `SANDBOX` | Simula confirmação imediata (dev/teste) |
| Multicaixa Express | `MULTICAIXA` | Referência EMIS; API real via env |
| Unitel Money | `UNITEL_MONEY` | Carteira móvel; API real via env |
| Transferência | `BANK_TRANSFER` | IBAN + confirmação manual pelo admin |

## Fluxo

1. Utilizador inicia pagamento em `/pagamentos` ou comissão vinculada.
2. O provider gera um **PaymentIntent** com instruções / referência.
3. Sandbox: botão «Confirmar pagamento de teste».
4. Multicaixa / Unitel / transferência: utilizador paga fora; admin confirma em `/admin/financeiro` se a API não estiver activa.
5. Registo em `payments` e actualização de `commissions` quando aplicável.

## Variáveis de ambiente

Ver `.env.example`. Sem chaves reais, Multicaixa e Unitel geram referências locais e instruções manuais.

## Ficheiros

- `src/lib/payments/` — providers e tipos
- `src/actions/payments.ts` — server actions
- `src/app/(dashboard)/pagamentos/page.tsx` — UI
- `src/app/(dashboard)/admin/financeiro/page.tsx` — confirmação admin

## Produção

1. Obter credenciais Multicaixa (EMIS) e/ou Unitel Money.
2. Preencher variáveis na Vercel.
3. Definir `PAYMENTS_SANDBOX=false`.
4. Configurar webhook (futuro) para confirmação automática.
