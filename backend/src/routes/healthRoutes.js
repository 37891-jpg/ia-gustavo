const express = require('express');
const router = express.Router();
const { getConnectionStatus } = require('../config/db');

/**
 * GET /api/health
 * Retorna o status de saúde da API e da conexão com o banco
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: getConnectionStatus() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
