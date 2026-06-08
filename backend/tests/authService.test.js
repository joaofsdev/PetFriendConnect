const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

process.env.JWT_SECRET = "test-secret";

const AuthService = require("../src/services/authService");
const {
  ConflictError,
  ValidationError,
  UnauthorizedError,
} = require("../src/utils/errors");

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.API_URL = "http://localhost:3001";
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "google-client-secret";
    process.env.FACEBOOK_CLIENT_ID = "facebook-client-id";
    process.env.FACEBOOK_CLIENT_SECRET = "facebook-client-secret";
  });

  describe("register", () => {
    const dadosValidos = {
      nome: "João",
      email: "joao@test.com",
      senha: "123456",
      tipo: "DONO",
    };

    it("deve registrar um novo usuário com sucesso", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.usuario.create.mockResolvedValue({
        id: 1,
        nome: "João",
        email: "joao@test.com",
        tipo: "DONO",
        telefone: null,
        endereco: null,
        dataCriacao: new Date(),
      });

      const resultado = await AuthService.register(dadosValidos);

      expect(resultado.usuario).toBeDefined();
      expect(resultado.token).toBeDefined();
      expect(prisma.usuario.create).toHaveBeenCalled();
    });

    it("deve lançar ConflictError se email já existe", async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 1 });

      await expect(AuthService.register(dadosValidos)).rejects.toThrow(
        ConflictError,
      );
    });

    it("deve lançar ValidationError para tipo inválido", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        AuthService.register({ ...dadosValidos, tipo: "INVALIDO" }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve impedir cadastro publico de ADMIN", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        AuthService.register({ ...dadosValidos, tipo: "ADMIN" }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("login", () => {
    it("deve fazer login com sucesso", async () => {
      const senhaHash = await bcryptjs.hash("123456", 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: "joao@test.com",
        senha: senhaHash,
        tipo: "DONO",
        ativo: true,
      });

      const resultado = await AuthService.login("joao@test.com", "123456");

      expect(resultado.token).toBeDefined();
      expect(resultado.usuario.senha).toBeUndefined();
    });

    it("deve lançar UnauthorizedError se email não existe", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        AuthService.login("naoexiste@test.com", "123456"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("deve lançar UnauthorizedError se senha incorreta", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: "joao@test.com",
        senha: await bcryptjs.hash("123456", 10),
        tipo: "DONO",
        ativo: true,
      });

      await expect(
        AuthService.login("joao@test.com", "senhaerrada"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("deve lançar UnauthorizedError se usuário inativo", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: "joao@test.com",
        senha: await bcryptjs.hash("123456", 10),
        tipo: "DONO",
        ativo: false,
      });

      await expect(
        AuthService.login("joao@test.com", "123456"),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe("validarToken", () => {
    it("deve validar token válido", async () => {
      const token = jwt.sign(
        { id: 1, email: "joao@test.com", tipo: "DONO" },
        process.env.JWT_SECRET,
      );

      const decoded = await AuthService.validarToken(token);

      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe("joao@test.com");
    });

    it("deve lançar UnauthorizedError para token inválido", async () => {
      await expect(AuthService.validarToken("token-invalido")).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it("deve lançar UnauthorizedError para token expirado", async () => {
      const token = jwt.sign(
        { id: 1 },
        process.env.JWT_SECRET,
        { expiresIn: "-1s" },
      );

      await expect(AuthService.validarToken(token)).rejects.toThrow(
        UnauthorizedError,
      );
    });
  });

  describe("obterUsuarioPorId", () => {
    it("deve retornar usuário existente", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        nome: "João",
        email: "joao@test.com",
        tipo: "DONO",
      });

      const usuario = await AuthService.obterUsuarioPorId(1);

      expect(usuario.id).toBe(1);
    });

    it("deve lançar ValidationError se usuário não encontrado", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(AuthService.obterUsuarioPorId(999)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("atualizarPerfil", () => {
    it("deve atualizar perfil do usuario logado", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        nome: "Joao",
        email: "joao@test.com",
        tipo: "DONO",
        ativo: true,
      });
      prisma.usuario.update.mockResolvedValue({
        id: 1,
        nome: "Joao Silva",
        email: "joao@test.com",
        tipo: "DONO",
        telefone: "11999999999",
        endereco: null,
        descricao: null,
        fotoPerfil: null,
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const usuario = await AuthService.atualizarPerfil(1, {
        nome: "Joao Silva",
        telefone: "11999999999",
      });

      expect(usuario.nome).toBe("Joao Silva");
      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({
            nome: "Joao Silva",
            telefone: "11999999999",
          }),
        }),
      );
    });

    it("deve lancar ValidationError se nenhum dado valido for informado", async () => {
      await expect(AuthService.atualizarPerfil(1, {})).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("alterarSenha", () => {
    it("deve alterar senha quando senha atual esta correta", async () => {
      const senhaHash = await bcryptjs.hash("senhaAtual123", 10);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        senha: senhaHash,
        ativo: true,
      });
      prisma.usuario.update.mockResolvedValue({});

      await AuthService.alterarSenha(1, "senhaAtual123", "novaSenha123");

      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.objectContaining({ senha: expect.any(String) }),
        }),
      );
    });

    it("deve lancar UnauthorizedError se senha atual estiver incorreta", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        senha: await bcryptjs.hash("senhaAtual123", 10),
        ativo: true,
      });

      await expect(
        AuthService.alterarSenha(1, "senhaErrada", "novaSenha123"),
      ).rejects.toThrow(UnauthorizedError);
    });

    it("deve lancar ValidationError se nova senha for igual a atual", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        senha: await bcryptjs.hash("senhaAtual123", 10),
        ativo: true,
      });

      await expect(
        AuthService.alterarSenha(1, "senhaAtual123", "senhaAtual123"),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("OAuth social", () => {
    it("deve gerar URL OAuth do Google com state assinado", () => {
      const url = AuthService.gerarUrlOAuth("google", "CUIDADOR");

      expect(url).toContain("https://accounts.google.com/o/oauth2/v2/auth");
      expect(url).toContain("client_id=google-client-id");
      expect(url).toContain("scope=openid+email+profile");
    });

    it("deve criar usuario via OAuth Google quando email ainda nao existe", async () => {
      const state = jwt.sign(
        { provider: "google", tipo: "DONO", purpose: "oauth-login" },
        process.env.JWT_SECRET,
      );

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "google-access-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            sub: "google-user-id",
            email: "social@test.com",
            email_verified: true,
            name: "Social User",
            picture: "https://example.com/avatar.jpg",
          }),
        });

      prisma.usuario.findUnique.mockResolvedValue(null);
      prisma.usuario.create.mockResolvedValue({
        id: 10,
        nome: "Social User",
        email: "social@test.com",
        tipo: "DONO",
        telefone: null,
        endereco: null,
        descricao: null,
        fotoPerfil: "https://example.com/avatar.jpg",
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      const resultado = await AuthService.loginOAuth("google", "code", state);

      expect(resultado.token).toBeDefined();
      expect(resultado.usuario.email).toBe("social@test.com");
      expect(prisma.usuario.create).toHaveBeenCalled();
    });

    it("deve autenticar usuario existente via OAuth Facebook", async () => {
      const state = jwt.sign(
        { provider: "facebook", tipo: "DONO", purpose: "oauth-login" },
        process.env.JWT_SECRET,
      );

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "facebook-access-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: "facebook-user-id",
            email: "existente@test.com",
            name: "Usuario Existente",
            picture: { data: { url: "https://example.com/facebook.jpg" } },
          }),
        });

      prisma.usuario.findUnique.mockResolvedValue({
        id: 11,
        nome: "Usuario Existente",
        email: "existente@test.com",
        senha: "hash",
        tipo: "DONO",
        ativo: true,
      });

      const resultado = await AuthService.loginOAuth("facebook", "code", state);

      expect(resultado.token).toBeDefined();
      expect(resultado.usuario.senha).toBeUndefined();
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it("deve recusar OAuth sem email", async () => {
      const state = jwt.sign(
        { provider: "facebook", tipo: "DONO", purpose: "oauth-login" },
        process.env.JWT_SECRET,
      );

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "facebook-access-token" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: "facebook-user-id",
            name: "Sem Email",
          }),
        });

      await expect(
        AuthService.loginOAuth("facebook", "code", state),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
