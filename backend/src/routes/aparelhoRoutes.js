const express = require('express');
const router = express.Router();
const aparelhoController = require('../controllers/aparelhoController');
const validateObjectId = require('../middlewares/validateObjectId');

// GET /api/aparelhos - Listar aparelhos
router.get('/', aparelhoController.listar);

// GET /api/aparelhos/:id - Buscar aparelho específico
router.get('/:id', validateObjectId, aparelhoController.buscarPorId);

// POST /api/aparelhos - Cadastrar novo aparelho
router.post('/', aparelhoController.cadastrar);

// PUT /api/aparelhos/:id - Atualizar aparelho existente
router.put('/:id', validateObjectId, aparelhoController.atualizar);

// DELETE /api/aparelhos/:id - Excluir aparelho
router.delete('/:id', validateObjectId, aparelhoController.excluir);

module.exports = router;
