jest.mock("@prisma/client", () => {
  const mockPrisma = {
    pet: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mockPrisma) };
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PetService = require("../src/services/petService");
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require("../src/utils/errors");

const petMock = {
  id: 1,
  nome: "Rex",
  raca: "Cachorro",
  idade: 3,
  descricao: "Brincalhão",
  donoId: 1,
  dataCriacao: new Date(),
  dataAtualizacao: new Date(),
  dono: { id: 1, nome: "João", email: "joao@test.com" },
};

describe("PetService", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("listarPets", () => {
    it("deve listar pets do dono", async () => {
      prisma.pet.findMany.mockResolvedValue([petMock]);

      const pets = await PetService.listarPets(1);

      expect(pets).toHaveLength(1);
      expect(pets[0].nome).toBe("Rex");
    });

    it("deve lançar ValidationError para donoId inválido", async () => {
      await expect(PetService.listarPets("abc")).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("obterPetPorId", () => {
    it("deve retornar pet do dono", async () => {
      prisma.pet.findUnique.mockResolvedValue(petMock);

      const pet = await PetService.obterPetPorId(1, 1);

      expect(pet.id).toBe(1);
    });

    it("deve lançar NotFoundError se pet não existe", async () => {
      prisma.pet.findUnique.mockResolvedValue(null);

      await expect(PetService.obterPetPorId(999, 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("deve lançar ForbiddenError se pet não pertence ao dono", async () => {
      prisma.pet.findUnique.mockResolvedValue(petMock);

      await expect(PetService.obterPetPorId(1, 2)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  describe("criarPet", () => {
    it("deve criar pet com sucesso", async () => {
      prisma.pet.create.mockResolvedValue(petMock);

      const pet = await PetService.criarPet(
        { nome: "Rex", especie: "Cachorro", idade: 3 },
        1,
      );

      expect(pet.nome).toBe("Rex");
      expect(prisma.pet.create).toHaveBeenCalled();
    });

    it("deve lançar ValidationError se nome vazio", async () => {
      await expect(
        PetService.criarPet({ nome: "", especie: "Cachorro" }, 1),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ValidationError se espécie vazia", async () => {
      await expect(
        PetService.criarPet({ nome: "Rex", especie: "" }, 1),
      ).rejects.toThrow(ValidationError);
    });

    it("deve lançar ValidationError se idade inválida", async () => {
      await expect(
        PetService.criarPet({ nome: "Rex", especie: "Cachorro", idade: -1 }, 1),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("atualizarPet", () => {
    it("deve atualizar pet com sucesso", async () => {
      prisma.pet.findUnique.mockResolvedValue(petMock);
      prisma.pet.update.mockResolvedValue({ ...petMock, nome: "Max" });

      const pet = await PetService.atualizarPet(1, 1, { nome: "Max" });

      expect(pet.nome).toBe("Max");
    });

    it("deve lançar NotFoundError se pet não existe", async () => {
      prisma.pet.findUnique.mockResolvedValue(null);

      await expect(
        PetService.atualizarPet(999, 1, { nome: "Max" }),
      ).rejects.toThrow(NotFoundError);
    });

    it("deve lançar ForbiddenError se pet não pertence ao dono", async () => {
      prisma.pet.findUnique.mockResolvedValue(petMock);

      await expect(
        PetService.atualizarPet(1, 2, { nome: "Max" }),
      ).rejects.toThrow(ForbiddenError);
    });

    it("deve lançar ValidationError se nenhum dado informado", async () => {
      prisma.pet.findUnique.mockResolvedValue(petMock);

      await expect(PetService.atualizarPet(1, 1, {})).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("removerPet", () => {
    it("deve remover pet com sucesso", async () => {
      prisma.pet.findUnique.mockResolvedValue(petMock);
      prisma.pet.delete.mockResolvedValue(petMock);

      const resultado = await PetService.removerPet(1, 1);

      expect(resultado).toBeNull();
      expect(prisma.pet.delete).toHaveBeenCalled();
    });

    it("deve lançar NotFoundError se pet não existe", async () => {
      prisma.pet.findUnique.mockResolvedValue(null);

      await expect(PetService.removerPet(999, 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("deve lançar ForbiddenError se pet não pertence ao dono", async () => {
      prisma.pet.findUnique.mockResolvedValue(petMock);

      await expect(PetService.removerPet(1, 2)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });
});
