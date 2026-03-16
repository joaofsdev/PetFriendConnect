# 🐾 PetFriend Connect

> Plataforma para conectar donos de pets a cuidadores locais de
> confiança.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

------------------------------------------------------------------------

# 📚 Arquitetura do Sistema (C4 Model)

A arquitetura do **PetFriend Connect** foi documentada utilizando o **C4
Model**, dividido em quatro níveis:

1.  System Context
2.  Container Diagram
3.  Component Diagram
4.  Code Diagram

------------------------------------------------------------------------

# 1️⃣ System Context

``` mermaid
flowchart LR

Owner[Dono de Pet]
Caretaker[Cuidador]

Frontend[Frontend React]
Backend[API Node.js]

DB[(MySQL Database)]

Owner --> Frontend
Caretaker --> Frontend

Frontend --> Backend

Backend --> DB
```

### Atores

**Dono de Pet** - Cadastrar pets - Buscar cuidadores - Agendar serviços

**Cuidador** - Definir disponibilidade - Visualizar reservas - Oferecer
serviços

------------------------------------------------------------------------

# 2️⃣ Container Diagram

``` mermaid
flowchart LR

User[Usuário]

Frontend[React SPA]

API[Node.js API Express]

Database[(MySQL)]

User --> Frontend
Frontend -->|REST API| API
API -->|Prisma ORM| Database
```

  Container        Tecnologia          Responsabilidade
  ---------------- ------------------- -----------------------
  Frontend         React.js            Interface do usuário
  Backend API      Node.js + Express   Lógica de negócio
  Banco de Dados   MySQL               Persistência de dados

------------------------------------------------------------------------

# 3️⃣ Component Diagram

``` mermaid
flowchart TD

Routes[Routes]
Controllers[Controllers]
Services[Services]
Repositories[Repositories]
Database[(MySQL)]

Routes --> Controllers
Controllers --> Services
Services --> Repositories
Repositories --> Database
```

### Camadas

**Routes** Define os endpoints da API.

**Controllers** Recebem requisições HTTP e validam dados.

**Services** Contêm as regras de negócio da aplicação.

**Repositories** Responsáveis pela comunicação com o banco usando
Prisma.

------------------------------------------------------------------------

# 4️⃣ Code Diagram

``` mermaid
flowchart TD

Server[server.js]

Routes[routes]
Controllers[controllers]
Services[services]
Repositories[repositories]
Database[(MySQL)]

Server --> Routes
Routes --> Controllers
Controllers --> Services
Services --> Repositories
Repositories --> Database
```

------------------------------------------------------------------------

# 📂 Estrutura de Pastas

    PetFriend/
    ├── backend/
    │   ├── prisma/
    │   │   └── schema.prisma
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── middlewares/
    │   │   ├── routes/
    │   │   ├── services/
    │   │   ├── utils/
    │   │   └── server.js
    │   ├── package.json
    │   └── .env
    │
    ├── frontend/
    │   ├── public/
    │   ├── src/
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── services/
    │   │   ├── contexts/
    │   │   ├── hooks/
    │   │   └── App.jsx
    │
    └── README.md

------------------------------------------------------------------------

# 🗄 Modelagem de Dados

  Entidade   Descrição
  ---------- -------------------------------
  Usuario    Representa donos e cuidadores
  Pet        Animal cadastrado
  Agenda     Horários disponíveis
  Reserva    Agendamento de serviço
  Servico    Tipo de serviço oferecido

------------------------------------------------------------------------

# 🔄 Fluxo da Transação de Agendamento

    BEGIN TRANSACTION

    1. Verificar disponibilidade do cuidador
    2. Criar reserva
    3. Atualizar agenda
    4. Registrar log
    5. COMMIT

    Se ocorrer erro → ROLLBACK

Isso garante consistência e evita reservas duplicadas.

------------------------------------------------------------------------

