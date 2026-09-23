const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Carrega variáveis de ambiente
dotenv.config();

const healthRoutes = require('./routes/healthRoutes');
const aparelhoRoutes = require('./routes/aparelhoRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

// Configuração de CORS flexível e segura
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parser de JSON com limite de tamanho seguro
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve o frontend estático quando acessado localmente
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Rotas da API
app.use('/api', healthRoutes);
app.use('/api/aparelhos', aparelhoRoutes);

// Rota fallback para o frontend em navegação SPA / arquivo estático
app.get('/', (req, res, next) => {
  res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).json({
        nome: 'Samsung Device Manager API',
        versao: '1.0.0',
        documentacao: '/api.md',
        status: 'online',
      });
    }
  });
});

// Middlewares de tratamento
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
