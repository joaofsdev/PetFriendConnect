# Status Do Projeto

Data da ultima revisao: 2026-06-08

## Resumo

O PetFriend Connect esta com o MVP principal funcional para donos, cuidadores e administradores. A area de usuario foi conectada com backend real, incluindo edicao de perfil, troca de senha, recuperacao de senha e preferencias de notificacao.

Tambem foram corrigidos pontos tecnicos importantes em pets, servicos, reservas, admin, lint e documentacao.

## Validacoes Recentes

- Backend: `npm.cmd test` passou com 82 testes.
- Frontend: `npm.cmd run lint` passou.
- Frontend: `npm.cmd run build` passou.
- Prisma Client regenerado apos alteracoes no schema.
- Backend: `npm.cmd audit --json` sem vulnerabilidades.
- Frontend: `npm.cmd audit --json` sem vulnerabilidades.

## Implementado

- Cadastro e login com JWT.
- Login social Google/Facebook, pendente de credenciais reais.
- Hash de senha com bcrypt.
- Middleware de autenticacao e autorizacao por tipo.
- Bloqueio de cadastro publico de `ADMIN`.
- Bloqueio de token para usuario inativo.
- Edicao de perfil do usuario.
- Troca de senha com senha atual.
- Recuperacao de senha com token hasheado e expiracao.
- Preferencias de notificacao persistidas.
- CRUD de pets restrito a `DONO`.
- Idade do pet opcional no banco e no frontend.
- Listagem e perfil de cuidadores.
- CRUD de servicos do cuidador.
- `GET /api/servicos/me` para servicos do cuidador logado.
- Gestao de agenda do cuidador.
- Criacao de reservas com transacao serializavel.
- Cancelamento de reservas.
- Checagem de reserva ativa por agenda.
- Painel admin com usuarios, denuncias, configs, logs e dashboard.
- Validacoes reforcadas no admin.
- Lint geral do frontend passando.

## Pendente Para Banco Real

Ainda falta rodar e validar com MySQL real:

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

Depois disso, testar manualmente:

- Cadastro/login.
- Recuperacao de senha.
- CRUD de pets.
- Criacao, cancelamento e nova reserva do mesmo slot.
- Fluxo do cuidador com servicos e agenda.
- Fluxos admin.

## Pendente Para Seguranca

- Fechar CORS por ambiente.
- Adicionar Helmet.
- Adicionar rate limit em login, cadastro e recuperacao de senha.
- Avaliar troca de JWT em localStorage/sessionStorage por cookie httpOnly.
- Revisar `JWT_SECRET` obrigatorio e forte na inicializacao.
- Manter auditoria npm zerada a cada mudanca de dependencias.
- Configurar envio real de email para recuperacao de senha em producao.
- Revisar logs para nao expor dados sensiveis.

## Observacoes Tecnicas

- Nao foi aplicada constraint unica simples em `Reserva.agendaId`, porque isso impediria reutilizar um slot apos cancelamento.
- A consistencia de reservas foi reforcada por transacao, checagem de reserva ativa por agenda e indice `Reserva(agendaId, status)`.
- `Agenda.reservaId` e `Reserva.agendaId` continuam redundantes. Remover essa redundancia exigiria uma refatoracao maior de modelo e frontend.
