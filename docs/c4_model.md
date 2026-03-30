# C4 Model - PetFriend Connect

## Nível 1 — System Context
Quem usa o sistema e com quais sistemas externos ele se conecta.

```mermaid
flowchart LR
  Dono["Dono
  (Dono de pet)"]
  Admin["Admin
  (Administrador da plataforma)"]
  Cuidador["Cuidador
  (Prestador de serviços)"]
  Sistema["PetFriend Connect
  (Plataforma de agendamento entre donos e cuidadores)"]
  DB["MySQL
  (Banco de dados relacional)"]

  Dono -- "cadastra pets,
  agenda serviços" --> Sistema
  Admin -- "modera, configura" --> Sistema
  Cuidador -- "gerencia agenda,
  oferece serviços" --> Sistema
  Sistema -- "lê / grava" --> DB

  style Dono fill:#3f3b86,color:#fff
  style Admin fill:#7c3a21,color:#fff
  style Cuidador fill:#3f3b86,color:#fff
  style Sistema fill:#0a5a4a,color:#fff
  style DB fill:#4b4b4b,color:#fff
```
## Nível 2 - Container Diagram
Quais são os blocos de execução do sistema: frontend, backend e banco.
```mermaid
flowchart TD
  Usuarios["Usuários
  (Dono / Cuidador)"]
  AdminExt["Admin
  (Administrador)"]

  subgraph PetFriend Connect
    Frontend["Frontend Web
    React.js + Axios
    [Feito por Iago]"]
    Painel["Painel Admin
    React.js (rotas admin)
    [Feito por Iago]"]
    API["API REST
    Node.js + Express
    Prisma ORM [João]"]
    DB["Banco de Dados
    MySQL + Prisma Schema"]
  end

  Usuarios -- "HTTPS" --> Frontend
  AdminExt -- "HTTPS" --> Painel
  Frontend -- "JSON/HTTPS" --> API
  Painel -- "JSON/HTTPS" --> API
  API -- "Prisma" --> DB

  style Usuarios fill:#3f3b86,color:#fff
  style AdminExt fill:#7c3a21,color:#fff
  style Frontend fill:#114b8c,color:#fff
  style Painel fill:#7c4a11,color:#fff
  style API fill:#0a5a4a,color:#fff
  style DB fill:#4b4b4b,color:#fff
```

## Nível 3 - Componentes do Frontend React
Páginas, componentes e contextos do React.
```mermaid
flowchart TD
  subgraph Frontend Web - React.js
    AuthCtx["AuthContext
    Estado global de autenticação"]
    Router["React Router
    Rotas + ProtectedRoute"]

    Login["Login / Cadastro
    Autenticação pública"]
    Pets["Meus Pets
    Lista, form, modal"]
    Cuidadores["Cuidadores / Agenda
    Perfil, calendário, reserva"]
    Reservas["Minhas Reservas
    Histórico e status"]
    Admin["Painel Admin
    Dashboard, Usuários, Denúncias, Configurações, Logs"]

    Shared["Componentes Compartilhados
    Header, Footer, Layout, LoadingState, ErrorMessage"]
    Axios["Axios API Client
    Interceptors, headers JWT"]
  end

  AuthCtx --> Login
  AuthCtx --> Pets
  AuthCtx --> Cuidadores
  
  Router --> Cuidadores

  Login --> Reservas
  Pets --> Admin
  Cuidadores --> Admin

  Reservas --> Shared
  Admin --> Shared

  Shared --> Axios

  style AuthCtx fill:#7c4a11,color:#fff
  style Router fill:#3f3b86,color:#fff
  style Login fill:#114b8c,color:#fff
  style Pets fill:#114b8c,color:#fff
  style Cuidadores fill:#114b8c,color:#fff
  style Reservas fill:#114b8c,color:#fff
  style Admin fill:#7c3a21,color:#fff
  style Shared fill:#4b4b4b,color:#fff
  style Axios fill:#0a5a4a,color:#fff
```

## Nível 3 — Componentes da API REST (Backend)
O que existe dentro da API REST — rotas, serviços e middleware.
```mermaid
flowchart TD
  subgraph API REST - Node.js + Express
    AuthMid["Auth Middleware
    Valida JWT, injeta req.user"]

    AuthR["Auth Routes
    /api/auth/*"]
    PetsR["Pets Routes
    /api/pets/*"]
    ResR["Reservas Routes
    /api/reservas/*"]
    CuidR["Cuidadores Routes
    /api/cuidadores/*"]
    AdminR["Admin Routes
    /api/admin/*"]

    AuthS["AuthService
    JWT, bcrypt
    registro / login"]
    PetS["PetService
    CRUD de pets
    validações"]
    ResS["ReservaService
    Transação ACID
    lock + rollback"]

    Prisma["Prisma Client
    ORM — acesso ao MySQL"]
  end

  AuthMid --> AuthR
  AuthMid --> PetsR
  AuthMid --> ResR

  AuthR --> AuthS
  AuthR --> CuidR
  CuidR --> AuthS

  AdminR --> PetS
  AdminR --> ResS
  PetsR --> PetS
  ResR --> ResS

  AuthS --> Prisma
  PetS --> Prisma
  ResS --> Prisma

  style AuthMid fill:#7c4a11,color:#fff
  style AuthR fill:#114b8c,color:#fff
  style PetsR fill:#114b8c,color:#fff
  style ResR fill:#114b8c,color:#fff
  style CuidR fill:#114b8c,color:#fff
  style AdminR fill:#7c3a21,color:#fff
  style AuthS fill:#0a5a4a,color:#fff
  style PetS fill:#0a5a4a,color:#fff
  style ResS fill:#0a5a4a,color:#fff
  style Prisma fill:#4b4b4b,color:#fff
```
## Nível 4 — Code (Transação ACID)
O detalhe mais granular: a lógica crítica da criação de reserva.
```mermaid
flowchart TD
  Start(["POST /api/reservas"])
  Auth["Auth Middleware
  Valida JWT do Dono"]
  Tx["prisma.$transaction
  Inicia transação ACID"]
  Check["agenda.findFirst()
  Verifica slot disponível"]
  Cond{"disponível?"}
  Rollback["ROLLBACK
  Erro: indisponível"]
  Create["reserva.create()
  Persiste reserva CONFIRMADA"]
  Update["agenda.update() + log
  Bloqueia slot + registra log"]
  Commit(["COMMIT"])

  Start --> Auth
  Auth --> Tx
  Tx --> Check
  Check --> Cond
  Cond -- "não" --> Rollback
  Cond -- "sim" --> Create
  Create --> Update
  Update --> Commit

  style Start fill:#4b4b4b,color:#fff
  style Auth fill:#7c4a11,color:#fff
  style Tx fill:#0a5a4a,color:#fff
  style Check fill:#114b8c,color:#fff
  style Cond fill:#222,color:#fff
  style Rollback fill:#7c2121,color:#fff
  style Create fill:#0a5a4a,color:#fff
  style Update fill:#0a5a4a,color:#fff
  style Commit fill:#2a5011,color:#fff
```