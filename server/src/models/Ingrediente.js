
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingrediente:
 *       type: object
 *       required:
 *         - alimento
 *         - peso
 *         - preco
 *         - unidade
 *         - fator_correcao
 *         - categoria
 *       properties:
 *         id:
 *           type: string
 *         alimento:
 *           type: string
 *           description: Nome do alimento
 *         peso:
 *           type: string
 *           description: Peso do ingrediente
 *         preco:
 *           type: number
 *           description: Preço do ingrediente
 *         unidade:
 *           type: string
 *           description: Unidade de medida
 *         fator_correcao:
 *           type: number
 *           description: Fator de correção do ingrediente
 *         categoria:
 *           type: string
 *           description: Categoria do ingrediente
 *         quantidade_estoque:
 *           type: number
 *           description: Quantidade em estoque
 *         data_validade:
 *           type: string
 *           format: date
 *         fornecedor:
 *           type: string
 *         ativo:
 *           type: boolean
 *           default: true
 */

const ingredienteSchema = new mongoose.Schema({
  alimento: {
    type: String,
    required: [true, 'Nome do alimento é obrigatório'],
    trim: true,
    unique: true,
    maxlength: [100, 'Nome do alimento não pode ter mais de 100 caracteres']
  },
  peso: {
    type: String,
    required: [true, 'Peso é obrigatório'],
    trim: true
  },
  preco: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço deve ser maior que zero']
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
  categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    trim: true
  },
  quantidade_estoque: {
    type: Number,
    min: [0, 'Quantidade em estoque não pode ser negativa']
  },
  data_validade: {
    type: Date
  },
  fornecedor: {
    type: String,
    trim: true
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
ingredienteSchema.index({ alimento: 'text', categoria: 'text' });
ingredienteSchema.index({ categoria: 1 });
ingredienteSchema.index({ ativo: 1 });

module.exports = mongoose.model('Ingrediente', ingredienteSchema);
