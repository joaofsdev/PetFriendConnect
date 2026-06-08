# API - PetFriend Connect

Base URL local: `http://localhost:3001/api`

Todas as respostas seguem este formato:

```json
{
  "error": false,
  "message": "Mensagem",
  "data": {},
  "statusCode": 200
}
```

Para rotas autenticadas, envie:

```http
Authorization: Bearer <token_jwt>
```

## Autenticacao

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | `/auth/register` | Nao | Cadastra DONO ou CUIDADOR |
| POST | `/auth/login` | Nao | Autentica e retorna JWT |
| POST | `/auth/forgot-password` | Nao | Solicita recuperacao de senha |
| POST | `/auth/reset-password` | Nao | Redefine senha com token |
| GET | `/auth/me` | Sim | Retorna usuario logado |
| PUT | `/auth/me` | Sim | Atualiza perfil e preferencias |
| PATCH | `/auth/me/senha` | Sim | Altera senha com senha atual |

### POST `/auth/register`

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "senha123",
  "tipo": "DONO",
  "telefone": "11999999999",
  "endereco": "Sao Paulo",
  "descricao": "Opcional"
}
```

`tipo` aceita apenas `DONO` ou `CUIDADOR`. Cadastro publico de `ADMIN` e bloqueado.

### POST `/auth/login`

```json
{
  "email": "maria@email.com",
  "senha": "senha123"
}
```

### POST `/auth/forgot-password`

```json
{
  "email": "maria@email.com"
}
```

A resposta e generica para evitar enumeracao de emails. Em ambiente local, `data.resetUrl` pode ser retornada para teste manual sem servico de email.

### POST `/auth/reset-password`

```json
{
  "token": "token_recebido",
  "novaSenha": "novaSenha123"
}
```

O token e armazenado no banco apenas em hash e expira em 30 minutos.

### PUT `/auth/me`

```json
{
  "nome": "Maria Silva",
  "telefone": "11999999999",
  "endereco": "Sao Paulo",
  "descricao": "Cuidadora experiente",
  "fotoPerfil": "https://exemplo.com/foto.jpg",
  "notificacoesEmail": true,
  "notificacoesSms": false
}
```

### PATCH `/auth/me/senha`

```json
{
  "senhaAtual": "senhaAtual123",
  "novaSenha": "novaSenha123"
}
```

## Pets

Todas as rotas de pets exigem usuario autenticado do tipo `DONO`.

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/pets` | Lista pets do dono logado |
| GET | `/pets/:id` | Detalha um pet do dono |
| POST | `/pets` | Cria pet |
| PUT | `/pets/:id` | Atualiza pet |
| DELETE | `/pets/:id` | Remove pet |

### POST `/pets`

```json
{
  "nome": "Rex",
  "especie": "Cachorro",
  "idade": 3,
  "observacoes": "Amigavel"
}
```

`idade` e opcional e pode ser `null`.

## Cuidadores

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| GET | `/cuidadores` | Sim | Lista cuidadores ativos |
| GET | `/cuidadores/:id` | Sim | Perfil publico do cuidador |
| GET | `/cuidadores/:id/agenda` | Sim | Slots disponiveis |

## Servicos

Rotas de escrita exigem usuario `CUIDADOR`.

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/servicos/me` | Lista servicos do cuidador logado |
| POST | `/servicos` | Cria servico |
| PUT | `/servicos/:id` | Atualiza servico do cuidador logado |

### POST `/servicos`

```json
{
  "nome": "Passeio",
  "descricao": "Passeio de 1 hora",
  "preco": 50,
  "duracao": 60
}
```

## Agenda

Rotas exigem usuario `CUIDADOR`.

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/agenda` | Lista agenda do cuidador |
| POST | `/agenda` | Cria slot de disponibilidade |
| DELETE | `/agenda/:id` | Remove slot sem reserva |

### POST `/agenda`

```json
{
  "servicoId": 1,
  "data": "2026-06-09T13:00:00.000Z"
}
```

## Reservas

| Metodo | Rota | Permissao | Descricao |
|---|---|---|---|
| GET | `/reservas` | DONO/CUIDADOR/ADMIN | Lista reservas do usuario |
| GET | `/reservas/:id` | Participante/ADMIN | Detalha reserva |
| POST | `/reservas` | DONO | Cria reserva |
| PATCH | `/reservas/:id/cancelar` | DONO | Cancela reserva |

### POST `/reservas`

```json
{
  "cuidadorId": 2,
  "petId": 1,
  "servicoId": 3,
  "agendaId": 4
}
```

A criacao usa transacao serializavel, valida pet do dono, servico ativo do cuidador, slot disponivel e inexistencia de reserva ativa para a mesma agenda.

Tambem e bloqueada a tentativa de reservar um servico proprio quando o dono e o cuidador sao a mesma conta ou quando as contas compartilham o mesmo telefone normalizado.

## Admin

Todas as rotas abaixo exigem usuario `ADMIN`.

### Usuarios

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/admin/usuarios` | Lista usuarios com filtros |
| GET | `/admin/usuarios/:id` | Detalha usuario |
| PUT | `/admin/usuarios/:id` | Edita usuario |
| DELETE | `/admin/usuarios/:id` | Desativa usuario |
| PATCH | `/admin/usuarios/:id/ativar` | Ativa usuario |

Filtros: `tipo`, `ativo`, `busca`, `page`, `limit`.

Regras importantes:

- `limit` maximo: 100.
- Admin nao pode desativar a propria conta.
- Edicao comum nao promove usuario para `ADMIN`.
- Email duplicado e recusado.

### Denuncias

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/admin/denuncias` | Lista denuncias |
| GET | `/admin/denuncias/:id` | Detalha denuncia |
| PATCH | `/admin/denuncias/:id` | Atualiza status/resolucao |

Status aceitos: `PENDENTE`, `EM_ANALISE`, `RESOLVIDA`, `REJEITADA`.

### Dashboard

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/admin/dashboard` | Estatisticas gerais |

### Configuracoes

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/admin/configuracoes` | Lista configuracoes |
| PUT | `/admin/configuracoes/:chave` | Atualiza configuracao |

### Logs

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/admin/logs` | Lista logs de auditoria |

Filtros: `usuarioId`, `acao`, `page`, `limit`.

## Codigos De Erro

| Codigo | Significado |
|---|---|
| 400 | Erro de validacao |
| 401 | Nao autenticado ou token invalido |
| 403 | Acesso proibido |
| 404 | Recurso nao encontrado |
| 409 | Conflito de dados |
| 500 | Erro interno |
