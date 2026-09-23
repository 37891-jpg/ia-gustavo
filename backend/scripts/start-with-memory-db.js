const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = require('../src/app');
const Aparelho = require('../src/models/Aparelho');

const PORT = process.env.PORT || 3000;

const aparelhosExemplo = [
  {
    modelo: 'Galaxy S25 Ultra',
    cor: 'Titânio Preto',
    preco: 8999.00,
    foto: 'https://images.samsung.com/is/image/samsung/p6pim/br/galaxy-s24/gallery/br-galaxy-s24-s928-sm-s928bzkpzto-thumb-539304918',
  },
  {
    modelo: 'Galaxy S25+',
    cor: 'Azul Safira',
    preco: 5999.00,
    foto: 'https://images.samsung.com/is/image/samsung/p6pim/br/galaxy-s24/gallery/br-galaxy-s24-plus-s926-sm-s926bzkpzto-thumb-539304918',
  },
  {
    modelo: 'Galaxy Z Fold 6',
    cor: 'Cinza',
    preco: 11999.00,
    foto: 'https://images.samsung.com/is/image/samsung/p6pim/br/sm-f956bzbazto/gallery/br-galaxy-z-fold6-f956-sm-f956bzbazto-thumb-542567431',
  },
  {
    modelo: 'Galaxy Z Flip 6',
    cor: 'Menta',
    preco: 6999.00,
    foto: 'https://images.samsung.com/is/image/samsung/p6pim/br/sm-f741blbazto/gallery/br-galaxy-z-flip6-f741-sm-f741blbazto-thumb-542567396',
  },
  {
    modelo: 'Galaxy A55 5G',
    cor: 'Azul Escuro',
    preco: 2199.00,
    foto: 'https://images.samsung.com/is/image/samsung/p6pim/br/sm-a556ezkbzto/gallery/br-galaxy-a55-5g-sm-a556-sm-a556ezkbzto-thumb-540306775',
  },
];

async function start() {
  console.log('Iniciando instância em memória do MongoDB para desenvolvimento/demonstração...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
  console.log('[DB] Conectado ao MongoDB em memória com sucesso.');

  // Popula dados iniciais
  await Aparelho.deleteMany({});
  await Aparelho.insertMany(aparelhosExemplo);
  console.log(`[Seed] 5 aparelhos de demonstração inseridos.`);

  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Samsung Device Manager - Servidor de Desenvolvimento`);
    console.log(` Interface Web: http://localhost:${PORT}`);
    console.log(` Health Check:  http://localhost:${PORT}/api/health`);
    console.log(` API Aparelhos: http://localhost:${PORT}/api/aparelhos`);
    console.log(`=======================================================`);
  });

  const shutdown = async () => {
    console.log('\nEncerrando servidor...');
    server.close(async () => {
      await mongoose.disconnect();
      await mongod.stop();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Erro ao iniciar servidor de desenvolvimento:', err);
  process.exit(1);
});
