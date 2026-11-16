# PatrocinaAê

Aplicação web de gestão de eventos e patrocínios construída com React, TypeScript, Vite e Tailwind-like CSS próprio. O projeto usa Supabase opcional para persistência.

## Requisitos
- Node.js 20+
- npm

## Rodar localmente
```bash
npm install
cp .env.example .env
npm run dev
```
Abra a URL mostrada pelo Vite (normalmente http://localhost:5173).

## Funcionalidades incluídas
- Dashboard com indicadores de captação e pipeline.
- Cadastro, edição e exclusão de eventos.
- CRM de patrocinadores com contato, segmento, valor, etapa e vínculo com evento.
- Cadastro de cotas e contrapartidas.
- Relatórios resumidos e impressão/exportação via diálogo do navegador.
- Interface responsiva para desktop e celular.
- Dados demonstrativos para experimentar sem backend.

## Supabase (opcional)
1. Crie um projeto no Supabase.
2. Abra SQL Editor e execute `supabase/schema.sql`.
3. Copie `.env.example` para `.env`.
4. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
5. Reinicie `npm run dev`.

**Importante:** o modo de demonstração mantém os dados apenas no estado da sessão. A integração inicial grava eventos e patrocinadores quando o Supabase está configurado. Antes de produção, implemente autenticação, isolamento por organização, políticas RLS por usuário/tenant e gestão segura de credenciais.

## Limitações conhecidas / próximos módulos
A interface apresenta cotas e relatórios demonstrativos. Para operação comercial real, complemente com:
- autenticação e perfis (administrador, equipe, patrocinador);
- propostas persistidas, PDF e assinatura;
- pagamentos PIX/cartão via provedor com backend seguro e webhooks;
- check-in, inscrições e certificados;
- upload de logos e documentos em Storage;
- trilha de auditoria, notificações e relatórios financeiros;
- IA por função server-side/Edge Function, nunca expondo chave privada no frontend.

## Estrutura
```text
src/
  App.tsx
  data.ts
  main.tsx
  styles.css
  types.ts
  lib/supabase.ts
supabase/
  schema.sql
```
