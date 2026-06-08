const { sendSuccess, sendError } = require("../utils/response.js");
const AdminService = require("../services/adminService.js");

// ===== USUÁRIOS =====

const listarUsuarios = async (req, res, next) => {
  try {
    const resultado = await AdminService.listarUsuarios(req.query);
    return sendSuccess(res, resultado, "Usuários listados com sucesso");
  } catch (erro) { next(erro); }
};

const obterUsuario = async (req, res, next) => {
  try {
    const usuario = await AdminService.obterUsuario(req.params.id);
    return sendSuccess(res, usuario, "Usuário obtido com sucesso");
  } catch (erro) { next(erro); }
};

const editarUsuario = async (req, res, next) => {
  try {
    const usuario = await AdminService.editarUsuario(req.params.id, req.body);
    await AdminService.registrarAcaoAdmin(req.user.id, "EDITAR_USUARIO", `Editou usuário #${req.params.id}`);
    return sendSuccess(res, usuario, "Usuário atualizado com sucesso");
  } catch (erro) { next(erro); }
};

const desativarUsuario = async (req, res, next) => {
  try {
    const usuario = await AdminService.desativarUsuario(req.params.id);
    await AdminService.registrarAcaoAdmin(req.user.id, "DESATIVAR_USUARIO", `Desativou usuário #${req.params.id}`);
    return sendSuccess(res, usuario, "Usuário desativado com sucesso");
  } catch (erro) { next(erro); }
};

const ativarUsuario = async (req, res, next) => {
  try {
    const usuario = await AdminService.ativarUsuario(req.params.id);
    await AdminService.registrarAcaoAdmin(req.user.id, "ATIVAR_USUARIO", `Reativou usuário #${req.params.id}`);
    return sendSuccess(res, usuario, "Usuário ativado com sucesso");
  } catch (erro) { next(erro); }
};

// ===== DENÚNCIAS =====

const listarDenuncias = async (req, res, next) => {
  try {
    const resultado = await AdminService.listarDenuncias(req.query);
    return sendSuccess(res, resultado, "Denúncias listadas com sucesso");
  } catch (erro) { next(erro); }
};

const obterDenuncia = async (req, res, next) => {
  try {
    const denuncia = await AdminService.obterDenuncia(req.params.id);
    return sendSuccess(res, denuncia, "Denúncia obtida com sucesso");
  } catch (erro) { next(erro); }
};

const atualizarDenuncia = async (req, res, next) => {
  try {
    const denuncia = await AdminService.atualizarDenuncia(req.params.id, req.body);
    await AdminService.registrarAcaoAdmin(req.user.id, "ATUALIZAR_DENUNCIA", `Atualizou denúncia #${req.params.id} para ${req.body.status}`);
    return sendSuccess(res, denuncia, "Denúncia atualizada com sucesso");
  } catch (erro) { next(erro); }
};

// ===== DASHBOARD =====

const obterDashboard = async (req, res, next) => {
  try {
    const dashboard = await AdminService.obterDashboard();
    return sendSuccess(res, dashboard, "Dashboard obtido com sucesso");
  } catch (erro) { next(erro); }
};

// ===== CONFIGURAÇÕES =====

const listarConfiguracoes = async (req, res, next) => {
  try {
    const configs = await AdminService.listarConfiguracoes();
    return sendSuccess(res, configs, "Configurações listadas com sucesso");
  } catch (erro) { next(erro); }
};

const atualizarConfiguracao = async (req, res, next) => {
  try {
    const config = await AdminService.atualizarConfiguracao(req.params.chave, req.body.valor);
    await AdminService.registrarAcaoAdmin(req.user.id, "ATUALIZAR_CONFIG", `Atualizou config "${req.params.chave}"`);
    return sendSuccess(res, config, "Configuração atualizada com sucesso");
  } catch (erro) { next(erro); }
};

// ===== LOGS =====

const listarLogs = async (req, res, next) => {
  try {
    const resultado = await AdminService.listarLogs(req.query);
    return sendSuccess(res, resultado, "Logs listados com sucesso");
  } catch (erro) { next(erro); }
};

module.exports = {
  listarUsuarios,
  obterUsuario,
  editarUsuario,
  desativarUsuario,
  ativarUsuario,
  listarDenuncias,
  obterDenuncia,
  atualizarDenuncia,
  obterDashboard,
  listarConfiguracoes,
  atualizarConfiguracao,
  listarLogs,
};
