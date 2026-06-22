# PetFriend Connect

Plataforma para conectar donos de pets a cuidadores locais, com gestao de pets, servicos, agenda, reservas e painel administrativo.

## Stack

| Camada | Tecnologias |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express, Prisma, JWT, bcrypt |
| Banco | MySQL |
| Testes | Jest no backend |
| Infra | Docker Compose, Nginx |

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

### Docker Compose

O projeto possui configuracao Docker para subir MySQL, backend e frontend juntos.

```bash
copy .env.docker.example .env
docker compose up --build
```

Servicos:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3001`
- MySQL: `localhost:3306`

Para popular o banco local com dados de teste:

```bash
docker compose exec backend npm run seed
```

Para expor o site temporariamente na internet com Cloudflare Quick Tunnel:

```bash
docker compose --profile tunnel up -d
docker compose logs -f cloudflared
```

O log do `cloudflared` exibira uma URL publica `https://...trycloudflare.com`. Use essa URL para apresentar o site. Como o frontend chama a API por `/api`, a mesma URL publica acessa frontend e backend.

Para parar os containers sem apagar o banco:

```bash
docker compose stop
```

Para parar e remover tambem o volume do MySQL:

```bash
docker compose down -v
```

Antes de usar em producao, altere os valores sensiveis no `.env`, principalmente `JWT_SECRET`, senhas do MySQL e credenciais OAuth.

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
VITE_API_URL=/api
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

Docker:

```bash
docker compose config
docker compose build
docker compose up -d
docker compose exec backend npm run seed
docker compose --profile tunnel up -d
```

## Contas Seed

As contas dependem do seed atual em `backend/prisma/seed.js`.

| Tipo | Email | Senha |
|---|---|---|
| Admin | `admin@petfriend.com` | `admin123` |
| Cuidador | `maria@petfriend.com` | `senha123` |
| Dono | `carlos@petfriend.com` | `senha123` |

## Documentacao

- API: `docs/API.md`
- Status e pendencias: `docs/STATUS.md`

## Pendencias Importantes

- Configurar envio real de email para recuperacao de senha.
- Configurar credenciais OAuth reais.

## Seguranca Em Producao

Antes de expor o sistema em producao:

1. **JWT_SECRET**: defina um valor forte e unico (minimo 32 caracteres aleatorios). O servidor recusa iniciar em producao com os valores default (`change_me_for_production`, `troque_esta_chave_em_producao`).
2. **Senhas de seed**: as contas criadas pelo `npm run seed` usam senhas fracas (`admin123`, `senha123`). Altere-as ou remova esses usuarios antes de ir a producao. As senhas podem ser configuradas via variaveis de ambiente (`SEED_ADMIN_PASSWORD`, etc.) no `.env`.
3. **MySQL**: troque `MYSQL_ROOT_PASSWORD` e `MYSQL_PASSWORD` no `.env` para valores fortes.
4. **CORS**: em producao, apenas a origem definida em `FRONTEND_URL` e aceita.
5. **Rate limit**: login, cadastro e recuperacao de senha possuem limite de 10 tentativas a cada 15 minutos por IP.
6. **Helmet**: headers de seguranca (CSP, HSTS, X-Frame-Options, etc.) sao aplicados automaticamente.
