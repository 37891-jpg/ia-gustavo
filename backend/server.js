const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Tenta conectar ao MongoDB se a URI estiver configurada
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn('AVISO: MONGODB_URI não fornecida. Operações no banco falharão até que o banco esteja configurado.');
    }

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` Servidor rodando com sucesso!`);
      console.log(` URL Local: http://localhost:${PORT}`);
      console.log(` Health:    http://localhost:${PORT}/api/health`);
      console.log(` Aparelhos: http://localhost:${PORT}/api/aparelhos`);
      console.log(`===============================================`);
    });

    // Encerramento gracioso (Graceful Shutdown)
    const shutdown = async (signal) => {
      console.log(`\nRecebido sinal ${signal}. Encerrando servidor graciosamente...`);
      server.close(async () => {
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          console.log('Conexão com MongoDB finalizada.');
        } catch (e) {
          console.error('Erro ao fechar conexão com MongoDB:', e.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('Falha crítica ao iniciar o servidor:', error.message);
    process.exit(1);
  }
}

startServer();
