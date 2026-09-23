const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Aparelho = require('../src/models/Aparelho');
const { validarCamposAparelho } = require('../src/controllers/aparelhoController');

// 1. Health Check
test('Health Check API', async (t) => {
  await t.test('GET /api/health deve responder 200 com status ok', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(res.body.timestamp);
    assert.ok(res.body.database);
  });
});

// 2. Validações Unitárias
test('Validação unitária de campos de aparelho', async (t) => {
  await t.test('Deve rejeitar aparelho sem modelo', () => {
    const erros = validarCamposAparelho({ cor: 'Preto', preco: 1000, foto: 'https://img.com/s25.png' });
    assert.ok(erros.some((e) => e.includes('modelo')));
  });

  await t.test('Deve rejeitar aparelho com modelo vazio', () => {
    const erros = validarCamposAparelho({ modelo: '   ', cor: 'Preto', preco: 1000, foto: 'https://img.com/s25.png' });
    assert.ok(erros.some((e) => e.includes('modelo')));
  });

  await t.test('Deve rejeitar aparelho sem cor', () => {
    const erros = validarCamposAparelho({ modelo: 'Galaxy S25', preco: 1000, foto: 'https://img.com/s25.png' });
    assert.ok(erros.some((e) => e.includes('cor')));
  });

  await t.test('Deve rejeitar aparelho com cor vazia', () => {
    const erros = validarCamposAparelho({ modelo: 'Galaxy S25', cor: '   ', preco: 1000, foto: 'https://img.com/s25.png' });
    assert.ok(erros.some((e) => e.includes('cor')));
  });

  await t.test('Deve rejeitar aparelho sem preço', () => {
    const erros = validarCamposAparelho({ modelo: 'Galaxy S25', cor: 'Preto', foto: 'https://img.com/s25.png' });
    assert.ok(erros.some((e) => e.includes('preco')));
  });

  await t.test('Deve rejeitar aparelho com preço negativo', () => {
    const erros = validarCamposAparelho({ modelo: 'Galaxy S25', cor: 'Preto', preco: -10, foto: 'https://img.com/s25.png' });
    assert.ok(erros.some((e) => e.includes('preco')));
  });

  await t.test('Deve rejeitar aparelho com preço não numérico', () => {
    const erros = validarCamposAparelho({ modelo: 'Galaxy S25', cor: 'Preto', preco: 'cinco mil', foto: 'https://img.com/s25.png' });
    assert.ok(erros.some((e) => e.includes('preco')));
  });

  await t.test('Deve rejeitar aparelho sem foto', () => {
    const erros = validarCamposAparelho({ modelo: 'Galaxy S25', cor: 'Preto', preco: 4999 });
    assert.ok(erros.some((e) => e.includes('foto')));
  });

  await t.test('Deve rejeitar foto com URL inválida', () => {
    const erros = validarCamposAparelho({ modelo: 'Galaxy S25', cor: 'Preto', preco: 4999, foto: 'ftp://invalido.com' });
    assert.ok(erros.some((e) => e.includes('foto')));
  });

  await t.test('Deve aceitar aparelho completo e válido', () => {
    const erros = validarCamposAparelho({
      modelo: 'Galaxy S25 Ultra',
      cor: 'Titânio Preto',
      preco: 8999.90,
      foto: 'https://images.samsung.com/foto.jpg',
    });
    assert.equal(erros.length, 0);
  });
});

// 3. Validações de Requisição HTTP
test('Validações de Requisição HTTP (POST /api/aparelhos)', async (t) => {
  await t.test('POST /api/aparelhos com payload vazio deve retornar 400', async () => {
    const res = await request(app).post('/api/aparelhos').send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Dados inválidos');
    assert.ok(res.body.detalhes.length >= 4);
  });

  await t.test('POST /api/aparelhos com preco negativo deve retornar 400', async () => {
    const res = await request(app)
      .post('/api/aparelhos')
      .send({
        modelo: 'Galaxy A55',
        cor: 'Azul Escuro',
        preco: -50,
        foto: 'https://images.samsung.com/foto.jpg',
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Dados inválidos');
    assert.ok(res.body.detalhes.some((msg) => msg.includes('preco')));
  });

  await t.test('POST /api/aparelhos com foto inválida deve retornar 400', async () => {
    const res = await request(app)
      .post('/api/aparelhos')
      .send({
        modelo: 'Galaxy A55',
        cor: 'Azul Escuro',
        preco: 2500,
        foto: 'string-nao-url',
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Dados inválidos');
    assert.ok(res.body.detalhes.some((msg) => msg.includes('foto')));
  });
});

// 4. Validações de Identificador MongoDB (:id)
test('Validação de Identificador MongoDB (:id)', async (t) => {
  await t.test('GET /api/aparelhos/:id com ID inválido deve retornar 400', async () => {
    const res = await request(app).get('/api/aparelhos/id-invalido-123');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ID inválido fornecido');
  });

  await t.test('PUT /api/aparelhos/:id com ID inválido deve retornar 400', async () => {
    const res = await request(app)
      .put('/api/aparelhos/id-invalido-123')
      .send({ preco: 3000 });
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ID inválido fornecido');
  });

  await t.test('DELETE /api/aparelhos/:id com ID inválido deve retornar 400', async () => {
    const res = await request(app).delete('/api/aparelhos/id-invalido-123');
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'ID inválido fornecido');
  });

  await t.test('PUT /api/aparelhos/:id com corpo vazio deve retornar 400', async () => {
    const idValido = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/aparelhos/${idValido}`)
      .send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.error, 'Dados inválidos');
  });
});

// 5. Tratamento de rotas inexistentes
test('Tratamento de rotas inexistentes (404)', async (t) => {
  await t.test('GET /api/rota-inexistente deve retornar 404', async () => {
    const res = await request(app).get('/api/rota-inexistente');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Rota não encontrada');
  });
});

// 6. Ciclo CRUD Completo com Banco de Dados em Memória
test('Ciclo Completo de CRUD (Integração com MongoDB)', async (t) => {
  let mongoServer;
  let idCriado;

  t.before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  t.after(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  await t.test('GET /api/aparelhos inicial deve retornar lista vazia []', async () => {
    const res = await request(app).get('/api/aparelhos');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.equal(res.body.length, 0);
  });

  await t.test('POST /api/aparelhos deve cadastrar um novo aparelho com sucesso (201)', async () => {
    const novo = {
      modelo: 'Galaxy S25 Ultra',
      cor: 'Titânio Preto',
      preco: 8999.90,
      foto: 'https://images.samsung.com/galaxy-s25-ultra.jpg',
    };

    const res = await request(app).post('/api/aparelhos').send(novo);
    assert.equal(res.status, 201);
    assert.ok(res.body._id);
    assert.equal(res.body.modelo, novo.modelo);
    assert.equal(res.body.cor, novo.cor);
    assert.equal(res.body.preco, novo.preco);
    assert.equal(res.body.foto, novo.foto);
    assert.ok(res.body.createdAt);
    assert.ok(res.body.updatedAt);

    idCriado = res.body._id;
  });

  await t.test('GET /api/aparelhos deve listar o aparelho cadastrado (200)', async () => {
    const res = await request(app).get('/api/aparelhos');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0]._id, idCriado);
    assert.equal(res.body[0].modelo, 'Galaxy S25 Ultra');
  });

  await t.test('GET /api/aparelhos/:id deve consultar o aparelho por ID (200)', async () => {
    const res = await request(app).get(`/api/aparelhos/${idCriado}`);
    assert.equal(res.status, 200);
    assert.equal(res.body._id, idCriado);
    assert.equal(res.body.modelo, 'Galaxy S25 Ultra');
  });

  await t.test('GET /api/aparelhos/:id inexistente deve retornar 404', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/aparelhos/${idInexistente}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Aparelho não encontrado');
  });

  await t.test('PUT /api/aparelhos/:id deve atualizar o aparelho (200)', async () => {
    const atualizacao = {
      cor: 'Titânio Cinza',
      preco: 8499.00,
    };

    const res = await request(app)
      .put(`/api/aparelhos/${idCriado}`)
      .send(atualizacao);

    assert.equal(res.status, 200);
    assert.equal(res.body._id, idCriado);
    assert.equal(res.body.cor, 'Titânio Cinza');
    assert.equal(res.body.preco, 8499.00);
    assert.equal(res.body.modelo, 'Galaxy S25 Ultra'); // modelo mantido
  });

  await t.test('PUT /api/aparelhos/:id inexistente deve retornar 404', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .put(`/api/aparelhos/${idInexistente}`)
      .send({ preco: 7000 });
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Aparelho não encontrado');
  });

  await t.test('DELETE /api/aparelhos/:id deve excluir o aparelho com sucesso (200)', async () => {
    const res = await request(app).delete(`/api/aparelhos/${idCriado}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.mensagem, 'Aparelho excluído com sucesso');
    assert.equal(res.body.id, idCriado);
  });

  await t.test('GET /api/aparelhos/:id após exclusão deve retornar 404', async () => {
    const res = await request(app).get(`/api/aparelhos/${idCriado}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Aparelho não encontrado');
  });

  await t.test('DELETE /api/aparelhos/:id inexistente deve retornar 404', async () => {
    const idInexistente = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/aparelhos/${idInexistente}`);
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Aparelho não encontrado');
  });
});
