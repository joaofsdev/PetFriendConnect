function admin(req, res, next) {
  if (req.usuario.tipo !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Permissão de administrador necessária.' });
  }
  next();
}

module.exports = admin;
