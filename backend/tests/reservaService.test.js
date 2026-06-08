jest.mock("@prisma/client", () => {
  const mockTx = {
    usuario: { findUnique: jest.fn(), findFirst: jest.fn() },
    pet: { findFirst: jest.fn() },
    servico: { findFirst: jest.fn() },
    agenda: { findFirst: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
    reserva: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    log: { create: jest.fn() },
  };

  const mockPrisma = {
    reserva: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockTx)),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: { TransactionIsolationLevel: { Serializable: "Serializable" } },
    StatusReserva: {
      CONFIRMADA: "CONFIRMADA",
      CANCELADA: "CANCELADA",
      CONCLUIDA: "CONCLUIDA",
    },
    __mockTx: mockTx,
  };
});

const { PrismaClient, __mockTx: tx } = require("@prisma/client");
const prisma = new PrismaClient();

const ReservaService = require("../src/services/reservaService");
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} = require("../src/utils/errors");

const reservaMock = {
  id: 1,
  agendaId: 1,
  donoId: 1,
  cuidadorId: 2,
  petId: 1,
  servicoId: 1,
  status: "CONFIRMADA",
  dataReserva: new Date(),
  dataAtualizacao: new Date(),
  agenda: { id: 1, data: new Date(), disponivel: false, reservaId: 1 },
  pet: { id: 1, nome: "Rex", raca: "Cachorro", idade: 3, fotoPet: null },
  servico: { id: 1, nome: "Banho", preco: 50, duracao: 60 },
  dono: { id: 1, nome: "João", email: "joao@test.com", telefone: null },
  cuidador: { id: 2, nome: "Maria", email: "maria@test.com", telefone: null, fotoPerfil: null },
  logs: [],
};

describe("ReservaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tx.usuario.findUnique.mockResolvedValue({
      id: 1,
      email: "dono@test.com",
      telefone: "11911111111",
    });
    tx.usuario.findFirst.mockResolvedValue({
      id: 2,
      email: "cuidador@test.com",
      telefone: "11922222222",
    });
  });

  describe("listarReservas", () => {
    it("deve listar reservas do dono", async () => {
      prisma.reserva.findMany.mockResolvedValue([reservaMock]);

      const reservas = await ReservaService.listarReservas(1, "DONO");

      expect(reservas).toHaveLength(1);
      expect(reservas[0].id).toBe(1);
      expect(prisma.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { donoId: 1 } }),
      );
    });

    it("deve listar reservas do cuidador", async () => {
      prisma.reserva.findMany.mockResolvedValue([reservaMock]);

      await ReservaService.listarReservas(2, "CUIDADOR");

      expect(prisma.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { cuidadorId: 2 } }),
      );
    });

    it("deve listar todas reservas para ADMIN", async () => {
      prisma.reserva.findMany.mockResolvedValue([reservaMock]);

      await ReservaService.listarReservas(1, "ADMIN");

      expect(prisma.reserva.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe("obterReservaPorId", () => {
    it("deve retornar reserva para o dono", async () => {
      prisma.reserva.findUnique.mockResolvedValue(reservaMock);

      const reserva = await ReservaService.obterReservaPorId(1, {
        id: 1,
        tipo: "DONO",
      });

      expect(reserva.id).toBe(1);
    });

    it("deve lançar NotFoundError se reserva não existe", async () => {
      prisma.reserva.findUnique.mockResolvedValue(null);

      await expect(
        ReservaService.obterReservaPorId(999, { id: 1, tipo: "DONO" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar ForbiddenError se usuário não tem permissão", async () => {
      prisma.reserva.findUnique.mockResolvedValue(reservaMock);

      await expect(
        ReservaService.obterReservaPorId(1, { id: 99, tipo: "DONO" }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve permitir acesso para ADMIN", async () => {
      prisma.reserva.findUnique.mockResolvedValue(reservaMock);

      const reserva = await ReservaService.obterReservaPorId(1, {
        id: 99,
        tipo: "ADMIN",
      });

      expect(reserva.id).toBe(1);
    });
  });

  describe("criarReserva", () => {
    const dadosReserva = {
      cuidadorId: 2,
      petId: 1,
      servicoId: 1,
      agendaId: 1,
    };

    it("deve criar reserva com sucesso", async () => {
      tx.pet.findFirst.mockResolvedValue({ id: 1, nome: "Rex", raca: "Cachorro", idade: 3, fotoPet: null });
      tx.servico.findFirst.mockResolvedValue({ id: 1, nome: "Banho", descricao: null, preco: 50, duracao: 60, cuidadorId: 2 });
      tx.agenda.findFirst.mockResolvedValue({ id: 1, data: new Date(), disponivel: true, reservaId: null });
      tx.reserva.findFirst.mockResolvedValue(null);
      tx.reserva.create.mockResolvedValue(reservaMock);
      tx.agenda.updateMany.mockResolvedValue({ count: 1 });
      tx.log.create.mockResolvedValue({});

      const reserva = await ReservaService.criarReserva(dadosReserva, 1);

      expect(reserva.id).toBe(1);
      expect(tx.reserva.create).toHaveBeenCalled();
    });

    it("deve lançar ForbiddenError se pet não pertence ao dono", async () => {
      await expect(
        ReservaService.criarReserva({ ...dadosReserva, cuidadorId: 1 }, 1),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve impedir reserva quando dono e cuidador usam o mesmo telefone", async () => {
      tx.usuario.findFirst.mockResolvedValue({
        id: 2,
        email: "cuidador@test.com",
        telefone: "(11) 91111-1111",
      });

      await expect(
        ReservaService.criarReserva(dadosReserva, 1),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lancar ForbiddenError se pet nao pertence ao dono", async () => {
      tx.pet.findFirst.mockResolvedValue(null);

      await expect(
        ReservaService.criarReserva(dadosReserva, 1),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar NotFoundError se serviço não encontrado", async () => {
      tx.pet.findFirst.mockResolvedValue({ id: 1 });
      tx.servico.findFirst.mockResolvedValue(null);

      await expect(
        ReservaService.criarReserva(dadosReserva, 1),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar ConflictError se horário não disponível", async () => {
      tx.pet.findFirst.mockResolvedValue({ id: 1 });
      tx.servico.findFirst.mockResolvedValue({ id: 1, cuidadorId: 2 });
      tx.agenda.findFirst.mockResolvedValue(null);

      await expect(
        ReservaService.criarReserva(dadosReserva, 1),
      ).rejects.toThrow(ConflictError);
    });

    it("deve lançar ValidationError para IDs inválidos", async () => {
      tx.pet.findFirst.mockResolvedValue({ id: 1 });
      tx.servico.findFirst.mockResolvedValue({ id: 1, cuidadorId: 2 });
      tx.agenda.findFirst.mockResolvedValue({
        id: 1,
        data: new Date(),
        disponivel: true,
        reservaId: null,
      });
      tx.reserva.findFirst.mockResolvedValue({ id: 99 });

      await expect(
        ReservaService.criarReserva(dadosReserva, 1),
      ).rejects.toThrow(ConflictError);
    });

    it("deve lancar ValidationError para IDs invalidos", async () => {
      await expect(
        ReservaService.criarReserva({ ...dadosReserva, petId: "abc" }, 1),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("cancelarReserva", () => {
    it("deve cancelar reserva com sucesso", async () => {
      tx.reserva.findUnique.mockResolvedValue(reservaMock);
      tx.reserva.update.mockResolvedValue({ ...reservaMock, status: "CANCELADA" });
      tx.agenda.updateMany.mockResolvedValue({ count: 1 });
      tx.log.create.mockResolvedValue({});

      // Override $transaction for cancelar (uses tx internally)
      prisma.$transaction.mockImplementation((fn) => fn(tx));

      const reserva = await ReservaService.cancelarReserva(1, 1);

      expect(reserva.status).toBe("CANCELADA");
    });

    it("deve lançar NotFoundError se reserva não existe", async () => {
      tx.reserva.findUnique.mockResolvedValue(null);

      await expect(
        ReservaService.cancelarReserva(999, 1),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar ForbiddenError se não é o dono", async () => {
      tx.reserva.findUnique.mockResolvedValue(reservaMock);

      await expect(
        ReservaService.cancelarReserva(1, 99),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar ConflictError se já cancelada", async () => {
      tx.reserva.findUnique.mockResolvedValue({
        ...reservaMock,
        status: "CANCELADA",
      });

      await expect(
        ReservaService.cancelarReserva(1, 1),
      ).rejects.toThrow(ConflictError);
    });

    it("deve lançar ConflictError se já concluída", async () => {
      tx.reserva.findUnique.mockResolvedValue({
        ...reservaMock,
        status: "CONCLUIDA",
      });

      await expect(
        ReservaService.cancelarReserva(1, 1),
      ).rejects.toThrow(ConflictError);
    });
  });
});
