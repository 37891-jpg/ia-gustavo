const app = require('../src/app');
const { connectDB } = require('../src/config/db');

/**
 * Handler Serverless para Vercel
 * Garante a inicialização/reutilização da conexão Mongoose antes de processar a requisição
 */
module.exports = async (req, res) => {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (error) {
      console.error('[Vercel Serverless DB Error]:', error);
      return res.status(503).json({
        error: 'Erro de conexão com o banco de dados no ambiente serverless',
        detalhes: [error.message],
      });
    }
  }
  return app(req, res);
};
