# 📖 Documentação da API - PetFriend Connect

**Base URL:** `http://localhost:3001/api`

Todas as respostas seguem o formato:
```json
{ "error": false, "message": "...", "data": {...}, "statusCode": 200 }
```

---

## 🔐 Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Cadastro de usuário | Não |
| POST | `/auth/login` | Login (retorna JWT) | Não |
| GET | `/auth/me` | Dados do usuário logado | Sim |

### POST /auth/register
```json
{
  "nome": "string (obrigatório)",
  "email": "string (obrigatório)",
  "senha": "string (min 6 chars)",
  "tipo": "DONO | CUIDADOR",
  "telefone": "string (opcional)"
}
```

### POST /auth/login
```json
{
  "email": "string",
  "senha": "string"
}
```
**Retorno:** `{ token: "jwt...", usuario: {...} }`

---

## 🐾 Pets

| Método | Rota | Descrição | Auth | Permissão |
|--------|------|-----------|------|-----------|
| GET | `/pets` | Listar meus pets | Sim | Qualquer |
| GET | `/pets/:id` | Detalhe do pet | Sim | Dono do pet |
| POST | `/pets` | Criar pet | Sim | Qualquer |
| PUT | `/pets/:id` | Atualizar pet | Sim | Dono do pet |
| DELETE | `/pets/:id` | Remover pet | Sim | Dono do pet |

### POST /pets
```json
{
  "nome": "string (obrigatório, min 2)",
  "especie": "string (obrigatório, min 2)",
  "raca": "string (opcional)",
  "idade": "int >= 0 (opcional)",
  "observacoes": "string (opcional)"
}
```

---

## 👤 Cuidadores

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/cuidadores` | Listar cuidadores | Sim |
| GET | `/cuidadores/:id` | Perfil do cuidador | Sim |
| GET | `/cuidadores/:id/agenda` | Agenda pública (slots disponíveis) | Sim |

---

## 🛠 Serviços (Cuidador)

| Método | Rota | Descrição | Auth | Permissão |
|--------|------|-----------|------|-----------|
| POST | `/servicos` | Criar serviço | Sim | CUIDADOR |
| PUT | `/servicos/:id` | Editar serviço | Sim | CUIDADOR |

### POST /servicos
```json
{
  "nome": "string (obrigatório)",
  "descricao": "string (opcional)",
  "preco": "decimal (obrigatório)",
  "duracao": "int em minutos (obrigatório)"
}
```

---

## 📅 Agenda (Cuidador)

| Método | Rota | Descrição | Auth | Permissão |
|--------|------|-----------|------|-----------|
| GET | `/agenda` | Listar minha agenda | Sim | CUIDADOR |
| POST | `/agenda` | Adicionar slot | Sim | CUIDADOR |
| DELETE | `/agenda/:id` | Remover slot | Sim | CUIDADOR |

### POST /agenda
```json
{
  "servicoId": "int (obrigatório)",
  "data": "datetime ISO (obrigatório)"
}
```

---

## 📋 Reservas

| Método | Rota | Descrição | Auth | Permissão |
|--------|------|-----------|------|-----------|
| GET | `/reservas` | Listar minhas reservas | Sim | DONO/CUIDADOR |
| GET | `/reservas/:id` | Detalhe da reserva | Sim | Participante |
| POST | `/reservas` | Criar reserva (transação ACID) | Sim | DONO |
| PATCH | `/reservas/:id/cancelar` | Cancelar reserva | Sim | DONO |

### POST /reservas
```json
{
  "agendaId": "int (obrigatório)",
  "petId": "int (obrigatório)"
}
```

---

## 🔧 Admin

> Todas as rotas requerem autenticação + tipo ADMIN.

### Usuários

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/usuarios` | Listar usuários |
| GET | `/admin/usuarios/:id` | Detalhe do usuário |
| PUT | `/admin/usuarios/:id` | Editar usuário |
| DELETE | `/admin/usuarios/:id` | Desativar usuário |
| PATCH | `/admin/usuarios/:id/ativar` | Reativar usuário |

**Query params (GET /admin/usuarios):** `tipo`, `ativo`, `busca`, `page`, `limit`

### Denúncias

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/denuncias` | Listar denúncias |
| GET | `/admin/denuncias/:id` | Detalhe da denúncia |
| PATCH | `/admin/denuncias/:id` | Atualizar status |

**Query params (GET /admin/denuncias):** `status` (PENDENTE, EM_ANALISE, RESOLVIDA, REJEITADA), `page`, `limit`

### PATCH /admin/denuncias/:id
```json
{
  "status": "PENDENTE | EM_ANALISE | RESOLVIDA | REJEITADA",
  "resolucao": "string (opcional)"
}
```

### Dashboard

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/dashboard` | Estatísticas gerais |

**Retorno:**
```json
{
  "totalUsuarios": 10,
  "totalPets": 5,
  "totalReservas": 20,
  "totalCuidadores": 4,
  "totalDonos": 5,
  "reservasPorStatus": { "PENDENTE": 3, "CONFIRMADA": 10, ... },
  "usuariosRecentes": [...]
}
```

### Configurações

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/configuracoes` | Listar configurações |
| PUT | `/admin/configuracoes/:chave` | Atualizar configuração |

### PUT /admin/configuracoes/:chave
```json
{ "valor": "string" }
```

### Logs

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/logs` | Listar logs de auditoria |

**Query params:** `usuarioId`, `acao`, `page`, `limit`

---

## 🔑 Headers de Autenticação

```
Authorization: Bearer <token_jwt>
```

---

## ⚠️ Códigos de Erro

| Código | Significado |
|--------|-------------|
| 400 | Erro de validação |
| 401 | Não autenticado / Token inválido |
| 403 | Acesso proibido (tipo de usuário não permitido) |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: horário já reservado) |
| 500 | Erro interno do servidor |
