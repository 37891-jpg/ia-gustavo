const mongoose = require('mongoose');

/**
 * Middleware para validar se o parâmetro :id da rota é um ObjectId válido do MongoDB
 */
function validateObjectId(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) || String(new mongoose.Types.ObjectId(id)) !== id) {
    return res.status(400).json({
      error: 'ID inválido fornecido',
      detalhes: [`O identificador '${id}' não possui um formato de ObjectId válido do MongoDB.`],
    });
  }

  next();
}

module.exports = validateObjectId;
