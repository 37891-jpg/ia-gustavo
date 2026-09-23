/**
 * Middleware central de tratamento de erros
 */
function errorHandler(err, req, res, next) {
  // Erro de parsing de JSON malformado no corpo da requisição
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Formato JSON inválido no corpo da requisição',
      detalhes: [err.message],
    });
  }

  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    const mensagens = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Dados inválidos',
      detalhes: mensagens,
    });
  }

  // Erro de conversão de tipo (CastError) do Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Tipo de dado inválido',
      detalhes: [`Valor '${err.value}' inválido para o campo '${err.path}'`],
    });
  }

  // Erro de conexão com banco de dados
  if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
    console.error('[Database Connection Error]:', err.message);
    return res.status(503).json({
      error: 'Serviço de banco de dados indisponível temporariamente',
      detalhes: ['Não foi possível conectar ao banco de dados MongoDB.'],
    });
  }

  // Erro genérico / inesperado
  console.error('[Server Error]:', err);
  return res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
}

/**
 * Middleware para rotas não encontradas (404)
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    error: 'Rota não encontrada',
    detalhes: [`O caminho ${req.method} ${req.originalUrl} não existe nesta API.`],
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
