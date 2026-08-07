# Cuidar em Casa — Gestão de Cuidados de Enfermagem Domiciliária

Software de gestão para a empresa: planeamento de visitas, utentes, registos clínicos e faturação.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Prisma 7 + PostgreSQL (driver adapter `@prisma/adapter-pg`)
- Auth.js (NextAuth v5) com login por email/password (2 perfis: `ADMIN`, `ENFERMEIRO`)
- jsPDF para exportação de faturas em PDF

## Correr localmente

1. Instalar dependências:

   ```bash
   npm install
   ```

2. Arrancar a base de dados local (Postgres gerido pelo Prisma, sem precisar de Docker):

   ```bash
   npx prisma dev -n enfermagem
   ```

   Isto deixa o terminal ocupado — deixa-o aberto. Numa janela nova continua os próximos passos.
   Se já correste isto antes, o URL de ligação é sempre o mesmo (guardado em `.env`).

3. Aplicar as migrações e semear os utilizadores iniciais (só necessário uma vez):

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

   Contas criadas pelo seed:
   - **Administração**: `admin@empresa.pt` / `admin123`
   - **Enfermeiro (teste)**: `enfermeiro@empresa.pt` / `enfermeiro123`

   ⚠️ Muda estas palavras-passe assim que tiveres acesso à aplicação em produção.

4. Arrancar a aplicação:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Produção

- **Código**: [github.com/BernardoRocha97/cuidaremcasa](https://github.com/BernardoRocha97/cuidaremcasa) (privado)
- **Base de dados**: Neon Postgres (região eu-west-2). Já tem as migrações aplicadas e o catálogo semeado.
- As credenciais de produção (`DATABASE_URL`, `AUTH_SECRET`) estão em `.env.production.local` (não commitado — usa esses valores ao configurar as variáveis de ambiente no Vercel).

### Ligar ao Vercel (falta fazer)

1. Em [vercel.com](https://vercel.com), importa o repositório `cuidaremcasa`.
2. Nas variáveis de ambiente do projeto, adiciona `DATABASE_URL` e `AUTH_SECRET` (valores em `.env.production.local`).
3. Faz deploy.

### Recriar a base de produção do zero (se necessário)

```bash
DATABASE_URL="<url-neon>" npx prisma migrate deploy
DATABASE_URL="<url-neon>" PROD_ADMIN_EMAIL="<email>" PROD_ADMIN_PASSWORD="<password>" npx tsx prisma/seed-production.ts
```

Ao contrário do `prisma/seed.ts` (usado em desenvolvimento, cria contas de teste fracas), o `seed-production.ts` só cria a conta de administração indicada nas variáveis de ambiente, mais o catálogo — sem dados de teste.

## Estrutura

- `prisma/schema.prisma` — modelo de dados (utentes, visitas, registos clínicos, faturas)
- `src/app/(app)/` — área autenticada: dashboard, planeamento, agenda, utentes, faturação, equipa
- `src/app/login/` — autenticação
- `src/auth.ts` / `src/auth.config.ts` — configuração de autenticação (o `.config.ts` é a versão "edge-safe" usada pelo `proxy.ts`)
- `src/proxy.ts` — middleware que protege rotas por perfil de acesso

## Por implementar no futuro (fora do âmbito da v1)

- Escalas/turnos automáticos e otimização de rotas
- Faturação eletrónica certificada (AT/e-fatura)
- Notificações e app mobile
