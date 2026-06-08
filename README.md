# PetFriend Connect

Plataforma para conectar donos de pets a cuidadores locais, com gestao de pets, servicos, agenda, reservas e painel administrativo.

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express, Prisma, JWT, bcrypt |
| Banco | MySQL |
| Testes | Jest no backend |

## Funcionalidades

- Cadastro e login de donos e cuidadores.
- OAuth Google/Facebook, dependente de credenciais reais.
- Edicao de perfil, troca e recuperacao de senha.
- Preferencias de notificacao por email/SMS.
- CRUD de pets para donos.
- Listagem de cuidadores.
- Cadastro de servicos e agenda para cuidadores.
- Reservas com transacao e protecao contra horario duplicado ativo.
- Cancelamento de reservas.
- Painel admin com usuarios, denuncias, configuracoes, logs e dashboard.

## Estrutura

```text
backend/
  prisma/
  src/
    controllers/
    middlewares/
    routes/
    services/
    utils/
  tests/

frontend/
  src/
    components/
    contexts/
    hooks/
    layouts/
    pages/
    routes/
    services/

docs/
```

## Como Executar

### Backend

```bash
cd backend
npm install
copy .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Servidor local: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Aplicacao local: `http://localhost:5173`

## Variaveis De Ambiente

Backend:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/petfriend"
JWT_SECRET="uma_chave_forte"
PORT=3001
API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:5173"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
```

Frontend:

```env
VITE_API_URL=http://localhost:3001/api
```

## Comandos De Validacao

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Contas Seed

As contas dependem do seed atual em `backend/prisma/seed.js`.

Exemplos comuns:

| Tipo | Email | Senha |
|---|---|---|
| Admin | `admin@petfriend.com` | `admin123` |
| Cuidador | `maria@petfriend.com` | `senha123` |
| Dono | `carlos@petfriend.com` | `senha123` |

## Documentacao

- API: `docs/API.md`
- Status e pendencias: `docs/STATUS.md`

## Pendencias Importantes

- Validar migrations e seed com MySQL real.
- Configurar envio real de email para recuperacao de senha.
- Fazer hardening de seguranca: CORS, Helmet, rate limit, JWT/cookies e auditoria npm.
- Configurar credenciais OAuth reais.
