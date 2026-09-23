const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('../src/config/db');
const Aparelho = require('../src/models/Aparelho');

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

async function seed() {
  try {
    console.log('Conectando ao MongoDB para popular dados de exemplo...');
    await connectDB();

    console.log('Limpando aparelhos existentes...');
    await Aparelho.deleteMany({});

    console.log('Inserindo aparelhos Samsung de exemplo...');
    const criados = await Aparelho.insertMany(aparelhosExemplo);
    console.log(`Sucesso! ${criados.length} aparelhos foram cadastrados.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar seed:', error.message);
    process.exit(1);
  }
}

seed();
