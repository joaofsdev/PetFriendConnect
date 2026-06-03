# Status Do Projeto

Data da ultima revisao: 2026-06-16

## Resumo

O PetFriend Connect esta com o MVP principal funcional para donos, cuidadores e administradores. A area de usuario foi conectada com backend real, incluindo edicao de perfil, troca de senha, recuperacao de senha e preferencias de notificacao.

Tambem foram corrigidos pontos tecnicos importantes em pets, servicos, reservas, admin, lint, Docker e documentacao.

## Validacoes Recentes

- Backend: testes automatizados passando.
- Frontend: lint passando.
- Frontend: build passando.
- Prisma Client regenerado apos alteracoes no schema.
- Backend: OAuth social coberto por testes unitarios principais.
- Docker Compose validado com MySQL, backend e frontend.
- Migrations Prisma aplicadas em banco MySQL via Docker.
- Seed executado com sucesso em ambiente Docker.

## Implementado

- Cadastro e login com JWT.
- Login social Google/Facebook, pendente de credenciais reais.
- Hash de senha com bcrypt.
- Middleware de autenticacao e autorizacao por tipo.
- Bloqueio de cadastro publico de `ADMIN`.
- Bloqueio de token para usuario inativo.
- Protecao de rotas do frontend por tipo de usuario.
- Header `X-Powered-By` desabilitado no Express.
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
- Bloqueio de autoagendamento por mesma conta ou mesmo telefone.
- Painel admin com usuarios, denuncias, configs, logs e dashboard.
- Validacoes reforcadas no admin.
- Docker Compose com MySQL, backend e frontend.
- GitHub Actions CI para backend, frontend e smoke test Docker.

## Teste Manual Recomendado

- Cadastro/login.
- Recuperacao de senha.
- CRUD de pets.
- Criacao, cancelamento e nova reserva do mesmo slot.
- Fluxo do cuidador com servicos e agenda.
- Fluxos admin.
- Subida via Docker Compose com seed.

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
