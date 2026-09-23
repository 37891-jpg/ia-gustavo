const mongoose = require('mongoose');

let isConnected = false;

/**
 * Conecta ao MongoDB gerenciando o estado de conexão (singleton)
 * Adequado tanto para servidor tradicional quanto para serverless (Vercel)
 */
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('[DB Warning] MONGODB_URI não foi definida no arquivo de ambiente (.env).');
    throw new Error('A variável de ambiente MONGODB_URI é obrigatória.');
  }

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('[DB] Conexão com MongoDB estabelecida com sucesso.');
    return mongoose.connection;
  } catch (error) {
    console.error('[DB Error] Falha ao conectar ao MongoDB:', error.message);
    throw error;
  }
}

function getConnectionStatus() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  getConnectionStatus,
};
