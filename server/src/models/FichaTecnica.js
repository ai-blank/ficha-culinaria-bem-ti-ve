
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     FichaTecnica:
 *       type: object
 *       required:
 *         - nome_receita
 *         - ingredientes
 *         - rendimento
 *         - unidade_rendimento
 *         - margem_lucro
 *       properties:
 *         id:
 *           type: string
 *         nome_receita:
 *           type: string
 *           description: Nome da receita
 *         ingredientes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ingrediente_id:
 *                 type: string
 *               quantidade_usada:
 *                 type: number
 *               preco_unitario:
 *                 type: number
 *               peso_compra:
 *                 type: number
 *               fator_correcao:
 *                 type: number
 *               custo_calculado:
 *                 type: number
 *         rendimento:
 *           type: number
 *         unidade_rendimento:
 *           type: string
 *         gas_energia:
 *           type: number
 *           default: 0
 *         embalagem:
 *           type: number
 *           default: 0
 *         mao_obra:
 *           type: number
 *           default: 0
 *         outros:
 *           type: number
 *           default: 0
 *         margem_lucro:
 *           type: number
 *         custo_total:
 *           type: number
 *         custo_por_unidade:
 *           type: number
 *         preco_venda_sugerido:
 *           type: number
 *         modo_preparo:
 *           type: string
 *         observacoes:
 *           type: string
 *         ativo:
 *           type: boolean
 *           default: true
 */

const fichaSchema = new mongoose.Schema({
  nome_receita: {
    type: String,
    required: [true, 'Nome da receita é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome da receita não pode ter mais de 200 caracteres']
  },
  ingredientes: [{
    ingrediente_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingrediente',
      required: true
    },
    nome: {
      type: String,
      required: [true, 'Nome do ingrediente é obrigatório'],
      trim: true
    },
    unidade: {
      type: String,
      required: [true, 'Unidade do ingrediente é obrigatória'],
      trim: true
    },
    quantidade_usada: {
      type: Number,
      required: [true, 'Quantidade usada é obrigatória'],
      min: [0, 'Quantidade deve ser maior que zero']
    },
    preco_unitario: {
      type: Number,
      required: [true, 'Preço unitário é obrigatório'],
      min: [0, 'Preço deve ser maior que zero']
    },
    peso_compra: {
      type: Number,
      required: [true, 'Peso de compra é obrigatório'],
      min: [0, 'Peso deve ser maior que zero']
    },
    fator_correcao: {
      type: Number,
      required: [true, 'Fator de correção é obrigatório'],
      min: [0, 'Fator de correção deve ser maior que zero']
    },
    custo_calculado: {
      type: Number,
      default: 0
    }
  }],
  rendimento: {
    type: Number,
    required: [true, 'Rendimento é obrigatório'],
    min: [0, 'Rendimento deve ser maior que zero']
  },
  unidade_rendimento: {
    type: String,
    required: [true, 'Unidade de rendimento é obrigatória'],
    trim: true
  },
  gas_energia: {
    type: Number,
    default: 0,
    min: [0, 'Valor deve ser maior ou igual a zero']
  },
  embalagem: {
    type: Number,
    default: 0,
    min: [0, 'Valor deve ser maior ou igual a zero']
  },
  mao_obra: {
    type: Number,
    default: 0,
    min: [0, 'Valor deve ser maior ou igual a zero']
  },
  outros: {
    type: Number,
    default: 0,
    min: [0, 'Valor deve ser maior ou igual a zero']
  },
  margem_lucro: {
    type: Number,
    required: [true, 'Margem de lucro é obrigatória'],
    min: [0, 'Margem de lucro deve ser maior ou igual a zero']
  },
  custo_total: {
    type: Number,
    default: 0
  },
  custo_por_unidade: {
    type: Number,
    default: 0
  },
  preco_venda_sugerido: {
    type: Number,
    default: 0
  },
  modo_preparo: {
    type: String,
    trim: true
  },
  observacoes: {
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
fichaSchema.index({ nome_receita: 'text' });
fichaSchema.index({ ativo: 1 });
fichaSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FichaTecnica', fichaSchema);
