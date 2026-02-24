const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas 
const auth = require('./middlewares/auth');
const admin = require('./middlewares/admin');
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const cuidadorRoutes = require('./routes/cuidadorRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const denunciaRoutes = require('./routes/denunciaRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pets', auth, petRoutes);
app.use('/api/cuidadores', auth, cuidadorRoutes);
app.use('/api/reservas', auth, reservaRoutes);
app.use('/api/denuncias', auth, denunciaRoutes);

app.use('/api/agendas', auth, agendaRoutes);
app.use('/api/admin', auth, admin, adminRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
