# Status do Projeto

## Resumo

O PetFriend Connect possui um MVP funcional para os fluxos principais de dono e cuidador. O backend principal esta coberto por testes, e o frontend passa em lint e build apos os ultimos ajustes.

O painel administrativo e as configuracoes de perfil ainda estao parcialmente implementados. As telas existem, mas parte delas ainda nao possui API correspondente.

## Validacoes Recentes

- Backend: `npm test` passou com 73 testes.
- Frontend: `npm run lint` passou.
- Frontend: `npm run build` passou.
- Backend: OAuth social coberto por testes unitarios principais.
- Backend: `npm install` apontou 1 vulnerabilidade de alta severidade via `npm audit`.

## Implementado

- Cadastro e login com JWT.
- Login social com Google e Facebook via OAuth, pendente de credenciais reais no ambiente.
- Hash de senha com bcrypt.
- Middleware de autenticacao.
- Bloqueio de cadastro publico de `ADMIN`.
- Protecao de rotas do frontend por tipo de usuario.
- Bloqueio de tokens antigos para usuarios inativos.
- CRUD de pets.
- Listagem e perfil de cuidadores.
- Cadastro e edicao de servicos do cuidador.
- Gestao de agenda do cuidador.
- Criacao de reservas com transacao.
- Cancelamento de reservas.
- Logs basicos de reserva.
- Seeds de dados de teste.
- Dashboards de dono e cuidador.
- Testes unitarios dos services do backend.

## Parcialmente Implementado

- Configuracoes de usuario: tela existe, mas faltam endpoints para atualizar perfil e senha.
- Painel admin: rotas e telas existem no frontend, mas o backend admin ainda nao foi implementado.
- Servicos do cuidador: funciona, mas o frontend lista os servicos proprios via listagem publica de cuidadores. O ideal e criar `GET /api/servicos/me`.

## Pendencias Criticas

1. Criar endpoints reais para o painel admin.
2. Criar endpoints para edicao de perfil e troca de senha.
3. Revisar vulnerabilidade apontada pelo `npm audit`.
4. Configurar credenciais reais de Google/Facebook OAuth no ambiente.

## Pendencias Tecnicas

- Atualizar o README principal com a stack real do projeto.
- Corrigir textos com encoding quebrado no README principal.
- Documentar endpoints reais em `docs/API.md` ou no README.
- Adicionar constraint de banco para impedir mais de uma reserva por slot de agenda.
- Revisar o relacionamento duplicado entre `Agenda.reservaId` e `Reserva.agendaId`.
- Rodar fluxo completo manual com banco MySQL real.

## Proximos Passos Recomendados

### Sprint 1 - Seguranca

- Bloquear registro publico de `ADMIN`. Concluido.
- Adicionar protecao de rotas por papel no frontend. Concluido.
- Impedir que usuarios inativos continuem usando tokens antigos. Concluido.
- Configurar OAuth Google/Facebook em ambiente real.
- Revisar exposicao de telas administrativas para usuarios comuns.

### Sprint 2 - Conta do Usuario

- Implementar `PUT /api/auth/me`.
- Implementar `PATCH /api/auth/me/senha`.
- Conectar a tela de configuracoes com a API.

### Sprint 3 - Admin MVP

- Implementar dashboard admin com contagens basicas.
- Implementar listagem de usuarios.
- Implementar ativar/desativar usuarios.
- Implementar listagem de logs.
- Registrar acoes administrativas relevantes.

### Sprint 4 - Polimento e Entrega

- Atualizar README.
- Criar documentacao da API.
- Rodar testes, lint e build finais.
- Testar os fluxos completos de dono e cuidador.
