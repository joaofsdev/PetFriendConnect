jest.mock("@prisma/client", () => {
  const mockPrisma = {
    usuario: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    servico: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    agenda: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CuidadorService = require("../src/services/cuidadorService");
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require("../src/utils/errors");

describe("CuidadorService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("listarCuidadores", () => {
    it("deve listar cuidadores ativos", async () => {
      prisma.usuario.findMany.mockResolvedValue([
        { id: 1, nome: "Maria", servicosCriados: [] },
      ]);

      const cuidadores = await CuidadorService.listarCuidadores();

      expect(cuidadores).toHaveLength(1);
      expect(prisma.usuario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tipo: "CUIDADOR", ativo: true },
        }),
      );
    });
  });

  describe("obterPerfilCuidador", () => {
    it("deve retornar perfil do cuidador", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        nome: "Maria",
        email: "maria@test.com",
        servicosCriados: [],
      });

      const cuidador = await CuidadorService.obterPerfilCuidador(1);

      expect(cuidador.nome).toBe("Maria");
    });

    it("deve lançar NotFoundError se cuidador não existe", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        CuidadorService.obterPerfilCuidador(999),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("criarServico", () => {
    const dadosServico = {
      nome: "Banho",
      descricao: "Banho completo",
      preco: 50,
      duracao: 60,
    };

    it("deve criar serviço com sucesso", async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 1,
        tipo: "CUIDADOR",
      });
      prisma.servico.create.mockResolvedValue({
        id: 1,
        ...dadosServico,
        cuidadorId: 1,
        ativo: true,
        dataCriacao: new Date(),
      });

      const servico = await CuidadorService.criarServico(1, dadosServico);

      expect(servico.nome).toBe("Banho");
      expect(prisma.servico.create).toHaveBeenCalled();
    });

    it("deve lançar ValidationError se nome vazio", async () => {
      await expect(
        CuidadorService.criarServico(1, { ...dadosServico, nome: "" }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ValidationError se preço inválido", async () => {
      await expect(
        CuidadorService.criarServico(1, { ...dadosServico, preco: 0 }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ValidationError se duração inválida", async () => {
      await expect(
        CuidadorService.criarServico(1, { ...dadosServico, duracao: 0 }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar NotFoundError se cuidador não existe", async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        CuidadorService.criarServico(999, dadosServico),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("editarServico", () => {
    const servicoMock = { id: 1, cuidadorId: 1, nome: "Banho" };

    it("deve editar serviço com sucesso", async () => {
      prisma.servico.findUnique.mockResolvedValue(servicoMock);
      prisma.servico.update.mockResolvedValue({
        ...servicoMock,
        nome: "Banho Premium",
      });

      const servico = await CuidadorService.editarServico(1, 1, {
        nome: "Banho Premium",
      });

      expect(servico.nome).toBe("Banho Premium");
    });

    it("deve lançar NotFoundError se serviço não existe", async () => {
      prisma.servico.findUnique.mockResolvedValue(null);

      await expect(
        CuidadorService.editarServico(999, 1, { nome: "X" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar ForbiddenError se serviço não pertence ao cuidador", async () => {
      prisma.servico.findUnique.mockResolvedValue(servicoMock);

      await expect(
        CuidadorService.editarServico(1, 99, { nome: "X" }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar ValidationError se nome vazio", async () => {
      prisma.servico.findUnique.mockResolvedValue(servicoMock);

      await expect(
        CuidadorService.editarServico(1, 1, { nome: "" }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ValidationError se preço inválido", async () => {
      prisma.servico.findUnique.mockResolvedValue(servicoMock);

      await expect(
        CuidadorService.editarServico(1, 1, { preco: -5 }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("adicionarSlot", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    it("deve adicionar slot com sucesso", async () => {
      prisma.servico.findUnique.mockResolvedValue({ id: 1, cuidadorId: 1 });
      prisma.agenda.findFirst.mockResolvedValue(null);
      prisma.agenda.create.mockResolvedValue({
        id: 1,
        cuidadorId: 1,
        servicoId: 1,
        data: futureDate,
        disponivel: true,
        servico: { id: 1, nome: "Banho", preco: 50, duracao: 60 },
      });

      const slot = await CuidadorService.adicionarSlot(1, {
        servicoId: 1,
        data: futureDate.toISOString(),
      });

      expect(slot.disponivel).toBe(true);
    });

    it("deve lançar ValidationError se servicoId ausente", async () => {
      await expect(
        CuidadorService.adicionarSlot(1, { data: futureDate.toISOString() }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ValidationError se data ausente", async () => {
      await expect(
        CuidadorService.adicionarSlot(1, { servicoId: 1 }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ValidationError se data no passado", async () => {
      await expect(
        CuidadorService.adicionarSlot(1, {
          servicoId: 1,
          data: "2020-01-01T10:00:00Z",
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ForbiddenError se serviço não pertence ao cuidador", async () => {
      prisma.servico.findUnique.mockResolvedValue({ id: 1, cuidadorId: 99 });

      await expect(
        CuidadorService.adicionarSlot(1, {
          servicoId: 1,
          data: futureDate.toISOString(),
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar ValidationError se slot já existe", async () => {
      prisma.servico.findUnique.mockResolvedValue({ id: 1, cuidadorId: 1 });
      prisma.agenda.findFirst.mockResolvedValue({ id: 1 });

      await expect(
        CuidadorService.adicionarSlot(1, {
          servicoId: 1,
          data: futureDate.toISOString(),
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("deletarSlot", () => {
    it("deve deletar slot com sucesso", async () => {
      prisma.agenda.findUnique.mockResolvedValue({
        id: 1,
        cuidadorId: 1,
        reservas: [],
      });
      prisma.agenda.delete.mockResolvedValue({});

      const resultado = await CuidadorService.deletarSlot(1, 1);

      expect(resultado.mensagem).toBe("Slot deletado com sucesso");
    });

    it("deve lançar NotFoundError se slot não existe", async () => {
      prisma.agenda.findUnique.mockResolvedValue(null);

      await expect(CuidadorService.deletarSlot(999, 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("deve lançar ForbiddenError se slot não pertence ao cuidador", async () => {
      prisma.agenda.findUnique.mockResolvedValue({
        id: 1,
        cuidadorId: 99,
        reservas: [],
      });

      await expect(CuidadorService.deletarSlot(1, 1)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it("deve lançar ValidationError se slot possui reservas", async () => {
      prisma.agenda.findUnique.mockResolvedValue({
        id: 1,
        cuidadorId: 1,
        reservas: [{ id: 1 }],
      });

      await expect(CuidadorService.deletarSlot(1, 1)).rejects.toThrow(
        ValidationError,
      );
    });
  });
});
