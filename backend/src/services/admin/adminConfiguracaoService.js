const prisma = require('../../config/database');

// Configurações padrão do sistema
const CONFIGURACOES_PADRAO = [
  { chave: 'manutencao', valor: 'false', descricao: 'Modo de manutenção do sistema' },
  { chave: 'max_pets_por_usuario', valor: '10', descricao: 'Número máximo de pets por usuário' },
  { chave: 'max_reservas_pendentes', valor: '5', descricao: 'Máximo de reservas pendentes por usuário' },
  { chave: 'prazo_cancelamento_horas', valor: '24', descricao: 'Prazo mínimo em horas para cancelamento' },
  { chave: 'nome_plataforma', valor: 'PetFriend Connect', descricao: 'Nome da plataforma' },
  { chave: 'email_contato', valor: 'contato@petfriend.com', descricao: 'Email de contato do sistema' },
];

async function inicializar() {
  for (const config of CONFIGURACOES_PADRAO) {
    const existe = await prisma.configuracao.findUnique({ where: { chave: config.chave } });
    if (!existe) {
      await prisma.configuracao.create({ data: config });
    }
  }
}

async function listar() {
  const configuracoes = await prisma.configuracao.findMany({
    orderBy: { chave: 'asc' },
  });

  // Se não houver configs, inicializa com padrão
  if (configuracoes.length === 0) {
    await inicializar();
    return prisma.configuracao.findMany({ orderBy: { chave: 'asc' } });
  }

  return configuracoes;
}

async function atualizar(chave, valor) {
  const config = await prisma.configuracao.findUnique({ where: { chave } });

  if (!config) {
    throw new Error('Configuração não encontrada');
  }

  const atualizada = await prisma.configuracao.update({
    where: { chave },
    data: { valor },
  });

  return atualizada;
}

module.exports = { listar, atualizar, inicializar };
