const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const prisma = new PrismaClient();

const SEED_PASSWORDS = {
  admin: process.env.SEED_ADMIN_PASSWORD || "admin123",
  cuidador1: process.env.SEED_CUIDADOR1_PASSWORD || "senha123",
  cuidador2: process.env.SEED_CUIDADOR2_PASSWORD || "senha123",
  dono1: process.env.SEED_DONO1_PASSWORD || "senha123",
  dono2: process.env.SEED_DONO2_PASSWORD || "senha123",
};

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Limpar dados existentes
  await prisma.log.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.agenda.deleteMany();
  await prisma.servico.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.usuario.deleteMany();

  // Criar Admin
  const admin = await prisma.usuario.create({
    data: {
      nome: "Admin User",
      email: "admin@petfriend.com",
      senha: await bcryptjs.hash(SEED_PASSWORDS.admin, 10),
      tipo: "ADMIN",
      telefone: "11999999999",
      ativo: true,
    },
  });
  console.log("✓ Admin criado:", admin.email);

  // Criar Cuidador 1
  const cuidador1 = await prisma.usuario.create({
    data: {
      nome: "Maria Silva",
      email: "maria@petfriend.com",
      senha: await bcryptjs.hash(SEED_PASSWORDS.cuidador1, 10),
      tipo: "CUIDADOR",
      telefone: "11988888888",
      endereco: "Rua A, 123, São Paulo",
      descricao: "Cuidadora experiente com 5 anos de experiência",
      ativo: true,
    },
  });
  console.log("✓ Cuidador 1 criado:", cuidador1.email);

  // Criar Serviço para Cuidador 1
  const servico1 = await prisma.servico.create({
    data: {
      nome: "Passeio Diário",
      descricao: "Passeio de 1 hora com seu pet",
      preco: 50,
      duracao: 60,
      cuidadorId: cuidador1.id,
      ativo: true,
    },
  });
  console.log("✓ Serviço 1 criado:", servico1.nome);

  // Criar Agenda para Cuidador 1 (próximos 7 dias)
  const agora = new Date();
  for (let i = 0; i < 7; i++) {
    const data = new Date(agora);
    data.setDate(data.getDate() + i);
    data.setHours(10, 0, 0, 0);

    await prisma.agenda.create({
      data: {
        cuidadorId: cuidador1.id,
        servicoId: servico1.id,
        data,
        disponivel: true,
      },
    });
  }
  console.log("✓ Agenda criada para Cuidador 1 (7 dias)");

  // Criar Cuidador 2
  const cuidador2 = await prisma.usuario.create({
    data: {
      nome: "João Santos",
      email: "joao@petfriend.com",
      senha: await bcryptjs.hash(SEED_PASSWORDS.cuidador2, 10),
      tipo: "CUIDADOR",
      telefone: "11987777777",
      endereco: "Av. B, 456, São Paulo",
      descricao: "Veterinário com paixão por cuidar de pets",
      ativo: true,
    },
  });
  console.log("✓ Cuidador 2 criado:", cuidador2.email);

  // Criar Serviço para Cuidador 2
  const servico2 = await prisma.servico.create({
    data: {
      nome: "Banho e Tosa",
      descricao: "Banho, tosa e limpeza de unhas",
      preco: 80,
      duracao: 120,
      cuidadorId: cuidador2.id,
      ativo: true,
    },
  });
  console.log("✓ Serviço 2 criado:", servico2.nome);

  // Criar Agenda para Cuidador 2 (próximos 7 dias)
  for (let i = 0; i < 7; i++) {
    const data = new Date(agora);
    data.setDate(data.getDate() + i);
    data.setHours(14, 0, 0, 0);

    await prisma.agenda.create({
      data: {
        cuidadorId: cuidador2.id,
        servicoId: servico2.id,
        data,
        disponivel: true,
      },
    });
  }
  console.log("✓ Agenda criada para Cuidador 2 (7 dias)");

  // Criar Dono 1
  const dono1 = await prisma.usuario.create({
    data: {
      nome: "Carlos Oliveira",
      email: "carlos@petfriend.com",
      senha: await bcryptjs.hash(SEED_PASSWORDS.dono1, 10),
      tipo: "DONO",
      telefone: "11986666666",
      endereco: "Rua C, 789, São Paulo",
      ativo: true,
    },
  });
  console.log("✓ Dono 1 criado:", dono1.email);

  // Criar Pet para Dono 1
  const pet1 = await prisma.pet.create({
    data: {
      nome: "Rex",
      raca: "Golden Retriever",
      idade: 3,
      descricao: "Cão amigável e brincalhão",
      donoId: dono1.id,
    },
  });
  console.log("✓ Pet 1 criado:", pet1.nome);

  // Criar Dono 2
  const dono2 = await prisma.usuario.create({
    data: {
      nome: "Fernanda Costa",
      email: "fernanda@petfriend.com",
      senha: await bcryptjs.hash(SEED_PASSWORDS.dono2, 10),
      tipo: "DONO",
      telefone: "11985555555",
      endereco: "Av. D, 321, São Paulo",
      ativo: true,
    },
  });
  console.log("✓ Dono 2 criado:", dono2.email);

  // Criar Pet para Dono 2
  const pet2 = await prisma.pet.create({
    data: {
      nome: "Miau",
      raca: "Gato Persa",
      idade: 2,
      descricao: "Gato calmo e carinhoso",
      donoId: dono2.id,
    },
  });
  console.log("✓ Pet 2 criado:", pet2.nome);

  console.log("\n✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
