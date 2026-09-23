const Aparelho = require('../models/Aparelho');

const urlRegex = /^https?:\/\/.+/i;

/**
 * Validação rigorosa dos campos de aparelho
 * @param {Object} dados
 * @param {boolean} isPartial - se true (PUT parcial), valida apenas campos presentes
 */
function validarCamposAparelho(dados, isPartial = false) {
  const erros = [];
  const { modelo, cor, preco, foto } = dados;

  // Validação de 'modelo'
  if (!isPartial || modelo !== undefined) {
    if (modelo === undefined || modelo === null) {
      erros.push("O campo 'modelo' é obrigatório.");
    } else if (typeof modelo !== 'string') {
      erros.push("O campo 'modelo' deve ser um texto.");
    } else if (modelo.trim().length === 0) {
      erros.push("O campo 'modelo' não pode estar vazio.");
    }
  }

  // Validação de 'cor'
  if (!isPartial || cor !== undefined) {
    if (cor === undefined || cor === null) {
      erros.push("O campo 'cor' é obrigatório.");
    } else if (typeof cor !== 'string') {
      erros.push("O campo 'cor' deve ser um texto.");
    } else if (cor.trim().length === 0) {
      erros.push("O campo 'cor' não pode estar vazio.");
    }
  }

  // Validação de 'preco'
  if (!isPartial || preco !== undefined) {
    if (preco === undefined || preco === null) {
      erros.push("O campo 'preco' é obrigatório.");
    } else if (typeof preco !== 'number' || Number.isNaN(preco)) {
      erros.push("O campo 'preco' deve ser um número válido.");
    } else if (preco < 0) {
      erros.push("O campo 'preco' deve ser maior ou igual a zero.");
    }
  }

  // Validação de 'foto'
  if (!isPartial || foto !== undefined) {
    if (foto === undefined || foto === null) {
      erros.push("O campo 'foto' é obrigatório.");
    } else if (typeof foto !== 'string') {
      erros.push("O campo 'foto' deve ser uma URL em formato de texto.");
    } else if (!urlRegex.test(foto.trim())) {
      erros.push("O campo 'foto' deve ser uma URL válida (iniciando com http:// ou https://).");
    }
  }

  return erros;
}

/**
 * GET /api/aparelhos
 * Listar todos os aparelhos
 */
async function listar(req, res, next) {
  try {
    const aparelhos = await Aparelho.find().sort({ createdAt: -1 });
    return res.status(200).json(aparelhos);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/aparelhos/:id
 * Consultar aparelho específico por ID
 */
async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const aparelho = await Aparelho.findById(id);

    if (!aparelho) {
      return res.status(404).json({
        error: 'Aparelho não encontrado',
        detalhes: [`Nenhum aparelho encontrado com o ID '${id}'.`],
      });
    }

    return res.status(200).json(aparelho);
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/aparelhos
 * Cadastrar novo aparelho
 */
async function cadastrar(req, res, next) {
  try {
    const erros = validarCamposAparelho(req.body, false);
    if (erros.length > 0) {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: erros,
      });
    }

    const { modelo, cor, preco, foto } = req.body;

    const novoAparelho = await Aparelho.create({
      modelo: modelo.trim(),
      cor: cor.trim(),
      preco: Number(preco),
      foto: foto.trim(),
    });

    return res.status(201).json(novoAparelho);
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/aparelhos/:id
 * Editar aparelho existente
 */
async function atualizar(req, res, next) {
  try {
    const { id } = req.params;

    // Garante que o corpo da requisição não está vazio
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: ['Envie ao menos um campo para atualização.'],
      });
    }

    const erros = validarCamposAparelho(req.body, true);
    if (erros.length > 0) {
      return res.status(400).json({
        error: 'Dados inválidos',
        detalhes: erros,
      });
    }

    const dadosAtualizados = {};
    if (req.body.modelo !== undefined) dadosAtualizados.modelo = req.body.modelo.trim();
    if (req.body.cor !== undefined) dadosAtualizados.cor = req.body.cor.trim();
    if (req.body.preco !== undefined) dadosAtualizados.preco = Number(req.body.preco);
    if (req.body.foto !== undefined) dadosAtualizados.foto = req.body.foto.trim();

    const aparelhoAtualizado = await Aparelho.findByIdAndUpdate(
      id,
      dadosAtualizados,
      { new: true, runValidators: true }
    );

    if (!aparelhoAtualizado) {
      return res.status(404).json({
        error: 'Aparelho não encontrado',
        detalhes: [`Nenhum aparelho encontrado com o ID '${id}'.`],
      });
    }

    return res.status(200).json(aparelhoAtualizado);
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/aparelhos/:id
 * Excluir aparelho
 */
async function excluir(req, res, next) {
  try {
    const { id } = req.params;
    const aparelhoExcluido = await Aparelho.findByIdAndDelete(id);

    if (!aparelhoExcluido) {
      return res.status(404).json({
        error: 'Aparelho não encontrado',
        detalhes: [`Nenhum aparelho encontrado com o ID '${id}'.`],
      });
    }

    return res.status(200).json({
      mensagem: 'Aparelho excluído com sucesso',
      id: aparelhoExcluido._id,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listar,
  buscarPorId,
  cadastrar,
  atualizar,
  excluir,
  validarCamposAparelho,
};
