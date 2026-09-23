const mongoose = require('mongoose');

// Expressão regular para validar formato de URL (http ou https)
const urlRegex = /^https?:\/\/.+/i;

const aparelhoSchema = new mongoose.Schema(
  {
    modelo: {
      type: String,
      required: [true, "O campo 'modelo' é obrigatório."],
      trim: true,
      minlength: [1, "O campo 'modelo' não pode estar vazio."],
    },
    cor: {
      type: String,
      required: [true, "O campo 'cor' é obrigatório."],
      trim: true,
      minlength: [1, "O campo 'cor' não pode estar vazio."],
    },
    preco: {
      type: Number,
      required: [true, "O campo 'preco' é obrigatório."],
      min: [0, "O campo 'preco' deve ser maior ou igual a zero."],
    },
    foto: {
      type: String,
      required: [true, "O campo 'foto' é obrigatório."],
      trim: true,
      validate: {
        validator: function (valor) {
          return urlRegex.test(valor);
        },
        message: "O campo 'foto' deve ser uma URL válida iniciando com http:// ou https://.",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Formatação do JSON gerado
aparelhoSchema.set('toJSON', {
  transform: (doc, ret) => {
    return ret;
  },
});

const Aparelho = mongoose.models.Aparelho || mongoose.model('Aparelho', aparelhoSchema);

module.exports = Aparelho;
