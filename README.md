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

## Deploy no Vercel

A base de dados local (`prisma dev`) só serve para desenvolvimento — não funciona em produção/serverless.
Para o deploy:

1. Cria um repositório no GitHub e faz push deste projeto.
2. Em [vercel.com](https://vercel.com), importa o repositório.
3. Na aba **Storage** do projeto Vercel, cria uma base de dados Postgres (Neon, integrado nativamente) — escolhe uma região na UE.
4. Copia o `DATABASE_URL` gerado para as variáveis de ambiente do projeto Vercel.
5. Gera um `AUTH_SECRET` de produção e adiciona-o também às variáveis de ambiente:

   ```bash
   npx auth secret
   ```

6. Faz deploy. Depois do primeiro deploy, corre as migrações contra a base de dados de produção:

   ```bash
   DATABASE_URL="<url-da-base-de-dados-de-producao>" npx prisma migrate deploy
   DATABASE_URL="<url-da-base-de-dados-de-producao>" npx prisma db seed
   ```

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
