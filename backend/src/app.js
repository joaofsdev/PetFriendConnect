const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas 
const auth = require('./middlewares/auth');
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const cuidadorRoutes = require('./routes/cuidadorRoutes');
const reservaRoutes = require('./routes/reservaRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pets', auth, petRoutes);
app.use('/api/cuidadores', auth, cuidadorRoutes);
app.use('/api/reservas', auth, reservaRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app;
