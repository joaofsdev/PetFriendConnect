jest.mock("@prisma/client", () => {
  const mockPrisma = {
    usuario: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    pet: { count: jest.fn() },
    reserva: { count: jest.fn(), groupBy: jest.fn() },
    denuncia: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    configuracao: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    log: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const AdminService = require("../src/services/adminService");
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} = require("../src/utils/errors");

describe("AdminService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("listarUsuarios", () => {
    it("deve listar usuarios com paginacao", async () => {
      prisma.usuario.findMany.mockResolvedValue([{ id: 1, nome: "Admin" }]);
      prisma.usuario.count.mockResolvedValue(1);

      const resultado = await AdminService.listarUsuarios({ page: 1, limit: 20 });

      expect(resultado.usuarios).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(resultado.page).toBe(1);
    });

    it("deve filtrar por tipo", async () => {
      prisma.usuario.findMany.mockResolvedValue([]);
      prisma.usuario.count.mockResolvedValue(0);

      await AdminService.listarUsuarios({ tipo: "DONO" });

      expect(prisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tipo: "DONO" }) }),
      );
    });

    it("deve lancar ValidationError para tipo invalido", async () => {
      await expect(AdminService.listarUsuarios({ tipo: "INVALIDO" })).rejects.toThrow(ValidationError);
    });

    it("deve lancar ValidationError para limite acima de 100", async () => {
      await expect(AdminService.listarUsuarios({ limit: 200 })).rejects.toThrow(ValidationError);
    });

    it("deve filtrar por busca", async () => {
      prisma.usuario.findMany.mockResolvedValue([]);
      prisma.usuario.count.mockResolvedValue(0);

      await AdminService.listarUsuarios({ busca: "maria" });

      expect(prisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { nome: { contains: "maria" } },
              { email: { contains: "maria" } },
            ]),
          }),
        }),
      );
    });
  });

  describe("obterUsuario", () => {
    it("deve retornar usuario por id", async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 1, nome: "Admin" });

      const usuario = await AdminService.obterUsuario(1);

      expect(usuario.id).toBe(1);
    });

    it("deve lancar NotFoundError se usuario nao existe", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(AdminService.obterUsuario(999)).rejects.toThrow(NotFoundError);
    });

    it("deve lancar ValidationError para id invalido", async () => {
      await expect(AdminService.obterUsuario("abc")).rejects.toThrow(ValidationError);
    });
  });

  describe("editarUsuario", () => {
    const usuarioExistente = { id: 2, nome: "Maria", email: "maria@test.com", tipo: "DONO", ativo: true };

    beforeEach(() => {
      prisma.usuario.findUnique.mockResolvedValue(usuarioExistente);
      prisma.usuario.update.mockResolvedValue({ ...usuarioExistente, nome: "Maria Silva" });
    });

    it("deve editar usuario com sucesso", async () => {
      const resultado = await AdminService.editarUsuario(2, { nome: "Maria Silva" }, 1);

      expect(resultado.nome).toBe("Maria Silva");
    });

    it("deve lancar ConflictError se email duplicado", async () => {
      prisma.usuario.findUnique
        .mockResolvedValueOnce(usuarioExistente)
        .mockResolvedValueOnce({ id: 99, email: "outro@test.com" });

      await expect(
        AdminService.editarUsuario(2, { email: "outro@test.com" }, 1),
      ).rejects.toThrow(ConflictError);
    });

    it("deve impedir alterar tipo de ADMIN", async () => {
      prisma.usuario.findUnique.mockResolvedValue({ ...usuarioExistente, tipo: "ADMIN" });

      await expect(
        AdminService.editarUsuario(2, { tipo: "DONO" }, 1),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve impedir admin desativar a propria conta", async () => {
      await expect(
        AdminService.editarUsuario(1, { ativo: false }, 1),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lancar ValidationError se nenhum dado valido", async () => {
      await expect(AdminService.editarUsuario(2, {}, 1)).rejects.toThrow(ValidationError);
    });
  });

  describe("desativarUsuario", () => {
    it("deve desativar usuario", async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 2, nome: "Maria" });
      prisma.usuario.update.mockResolvedValue({ id: 2, ativo: false });

      const resultado = await AdminService.desativarUsuario(2, 1);

      expect(resultado.ativo).toBe(false);
    });

    it("deve impedir desativar a propria conta", async () => {
      await expect(AdminService.desativarUsuario(1, 1)).rejects.toThrow(ForbiddenError);
    });
  });

  describe("ativarUsuario", () => {
    it("deve ativar usuario", async () => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 2, nome: "Maria" });
      prisma.usuario.update.mockResolvedValue({ id: 2, ativo: true });

      const resultado = await AdminService.ativarUsuario(2);

      expect(resultado.ativo).toBe(true);
    });
  });

  describe("listarDenuncias", () => {
    it("deve listar denuncias com paginacao", async () => {
      prisma.denuncia.findMany.mockResolvedValue([{ id: 1, status: "PENDENTE" }]);
      prisma.denuncia.count.mockResolvedValue(1);

      const resultado = await AdminService.listarDenuncias({});

      expect(resultado.denuncias).toHaveLength(1);
      expect(resultado.total).toBe(1);
    });

    it("deve filtrar por status", async () => {
      prisma.denuncia.findMany.mockResolvedValue([]);
      prisma.denuncia.count.mockResolvedValue(0);

      await AdminService.listarDenuncias({ status: "RESOLVIDA" });

      expect(prisma.denuncia.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: "RESOLVIDA" } }),
      );
    });

    it("deve lancar ValidationError para status invalido", async () => {
      await expect(AdminService.listarDenuncias({ status: "INVALIDO" })).rejects.toThrow(ValidationError);
    });
  });

  describe("obterDenuncia", () => {
    it("deve retornar denuncia por id", async () => {
      prisma.denuncia.findUnique.mockResolvedValue({ id: 1, motivo: "Spam" });

      const denuncia = await AdminService.obterDenuncia(1);

      expect(denuncia.motivo).toBe("Spam");
    });

    it("deve lancar NotFoundError se denuncia nao existe", async () => {
      prisma.denuncia.findUnique.mockResolvedValue(null);

      await expect(AdminService.obterDenuncia(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("atualizarDenuncia", () => {
    it("deve atualizar status da denuncia", async () => {
      prisma.denuncia.findUnique.mockResolvedValue({ id: 1, status: "PENDENTE" });
      prisma.denuncia.update.mockResolvedValue({ id: 1, status: "RESOLVIDA" });

      const resultado = await AdminService.atualizarDenuncia(1, { status: "RESOLVIDA" });

      expect(resultado.status).toBe("RESOLVIDA");
    });

    it("deve lancar ValidationError para status invalido", async () => {
      prisma.denuncia.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        AdminService.atualizarDenuncia(1, { status: "INVALIDO" }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("obterDashboard", () => {
    it("deve retornar metricas do dashboard", async () => {
      prisma.usuario.count.mockResolvedValue(10);
      prisma.pet.count.mockResolvedValue(5);
      prisma.reserva.count.mockResolvedValue(3);
      prisma.reserva.groupBy.mockResolvedValue([{ status: "CONFIRMADA", _count: { id: 2 } }]);
      prisma.usuario.findMany.mockResolvedValue([{ id: 1, nome: "Admin" }]);

      const dashboard = await AdminService.obterDashboard();

      expect(dashboard.totalUsuarios).toBe(10);
      expect(dashboard.totalPets).toBe(5);
      expect(dashboard.totalReservas).toBe(3);
    });
  });

  describe("listarConfiguracoes", () => {
    it("deve listar todas as configuracoes", async () => {
      prisma.configuracao.findMany.mockResolvedValue([{ chave: "site_name", valor: "PetFriend" }]);

      const configs = await AdminService.listarConfiguracoes();

      expect(configs).toHaveLength(1);
    });
  });

  describe("atualizarConfiguracao", () => {
    it("deve atualizar configuracao existente", async () => {
      prisma.configuracao.findUnique.mockResolvedValue({ chave: "site_name", valor: "Old" });
      prisma.configuracao.update.mockResolvedValue({ chave: "site_name", valor: "New" });

      const resultado = await AdminService.atualizarConfiguracao("site_name", "New");

      expect(resultado.valor).toBe("New");
    });

    it("deve lancar NotFoundError se chave nao existe", async () => {
      prisma.configuracao.findUnique.mockResolvedValue(null);

      await expect(
        AdminService.atualizarConfiguracao("inexistente", "val"),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lancar ValidationError se valor ausente", async () => {
      await expect(AdminService.atualizarConfiguracao("key", null)).rejects.toThrow(ValidationError);
    });

    it("deve lancar ValidationError se valor excede 1000 chars", async () => {
      await expect(
        AdminService.atualizarConfiguracao("key", "x".repeat(1001)),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("listarLogs", () => {
    it("deve listar logs com paginacao", async () => {
      prisma.log.findMany.mockResolvedValue([{ id: 1, acao: "LOGIN" }]);
      prisma.log.count.mockResolvedValue(1);

      const resultado = await AdminService.listarLogs({});

      expect(resultado.logs).toHaveLength(1);
      expect(resultado.total).toBe(1);
    });

    it("deve filtrar por acao", async () => {
      prisma.log.findMany.mockResolvedValue([]);
      prisma.log.count.mockResolvedValue(0);

      await AdminService.listarLogs({ acao: "EDITAR" });

      expect(prisma.log.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ acao: { contains: "EDITAR" } }),
        }),
      );
    });
  });

  describe("registrarAcaoAdmin", () => {
    it("deve criar log de acao", async () => {
      prisma.log.create.mockResolvedValue({ id: 1, usuarioId: 1, acao: "TEST" });

      const log = await AdminService.registrarAcaoAdmin(1, "TEST", "Descricao");

      expect(prisma.log.create).toHaveBeenCalledWith({
        data: { usuarioId: 1, acao: "TEST", descricao: "Descricao" },
      });
    });
  });
});
