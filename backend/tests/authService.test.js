const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock Prisma
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
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
  beforeEach(() => jest.clearAllMocks());

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
});
