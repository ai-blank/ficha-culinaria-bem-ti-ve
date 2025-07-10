
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Mix:
 *       type: object
 *       required:
 *         - nome
 *         - ingredientes
 *         - categoria
 *       properties:
 *         id:
 *           type: string
 *         nome:
 *           type: string
 *           description: Nome do mix
 *         ingredientes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ingredienteId:
 *                 type: string
 *               quantidade:
 *                 type: number
 *               unidade:
 *                 type: string
 *         categoria:
 *           type: string
 *           description: Categoria do mix
 *         peso_total:
 *           type: string
 *           description: Peso total do mix
 *         preco_total:
 *           type: number
 *           description: Preço total calculado
 *         unidade:
 *           type: string
 *           description: Unidade de medida do mix
 *         fator_correcao:
 *           type: number
 *           description: Fator de correção médio
 *         ativo:
 *           type: boolean
 *           default: true
 *         descricao:
 *           type: string
 *           description: Descrição do mix
 */

const mixSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do mix é obrigatório'],
    trim: true,
    unique: true,
    maxlength: [100, 'Nome do mix não pode ter mais de 100 caracteres']
  },
  ingredientes: [{
    ingredienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingrediente',
      required: true
    },
    quantidade: {
      type: Number,
      required: true,
      min: [0, 'Quantidade deve ser maior que zero']
    },
    unidade: {
      type: String,
      required: true,
      trim: true
    }
  }],
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true
  },
  peso_total: {
    type: String,
    required: [true, 'Peso total é obrigatório'],
    trim: true
  },
  preco_total: {
    type: Number,
    required: [true, 'Preço total é obrigatório'],
    min: [0, 'Preço total deve ser maior que zero']
  },
  unidade: {
    type: String,
    required: [true, 'Unidade é obrigatória'],
    trim: true
  },
  fator_correcao: {
    type: Number,
    required: [true, 'Fator de correção é obrigatório'],
    min: [0, 'Fator de correção deve ser maior que zero']
  },
  ativo: {
    type: Boolean,
    default: true
  },
  descricao: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
mixSchema.index({ nome: 'text', categoria: 'text' });
mixSchema.index({ categoria: 1 });
mixSchema.index({ ativo: 1 });

module.exports = mongoose.model('Mix', mixSchema);
