const prisma = require('./src/config/database');

async function seed() {
  // Criar serviço para a cuidadora Maria (id: 2)
  const servico = await prisma.servico.create({
    data: {
      nome: 'Passeio',
      descricao: 'Passeio de 1 hora',
      preco: 50.00,
      cuidadorId: 2,
    },
  });
  console.log('Serviço criado:', servico);

  // Criar agenda para amanhã
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(0, 0, 0, 0);

  const agenda = await prisma.agenda.create({
    data: {
      cuidadorId: 2,
      data: amanha,
      horaInicio: '09:00',
      horaFim: '10:00',
      disponivel: true,
    },
  });
  console.log('Agenda criada:', agenda);

  await prisma.$disconnect();
}

seed().catch(console.error);
