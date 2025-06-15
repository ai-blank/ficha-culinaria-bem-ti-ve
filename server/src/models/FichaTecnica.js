
const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     IngredienteFicha:
 *       type: object
 *       required:
 *         - ingrediente_id
 *         - nome
 *         - quantidade_usada
 *         - unidade
 *         - preco_unitario
 *         - peso_compra
 *         - fator_correcao
 *       properties:
 *         ingrediente_id:
 *           type: string
 *         nome:
 *           type: string
 *         quantidade_usada:
 *           type: number
 *         unidade:
 *           type: string
 *         preco_unitario:
 *           type: number
 *         peso_compra:
 *           type: number
 *         fator_correcao:
 *           type: number
 *         custo_calculado:
 *           type: number
 *     
 *     FichaTecnica:
 *       type: object
 *       required:
 *         - nome_receita
 *         - ingredientes
 *         - gas_energia
 *         - embalagem
 *         - mao_obra
 *         - outros
 *         - rendimento
 *         - unidade_rendimento
 *         - margem_lucro
 *       properties:
 *         id:
 *           type: string
 *         nome_receita:
 *           type: string
 *         ingredientes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IngredienteFicha'
 *         gas_energia:
 *           type: number
 *         embalagem:
 *           type: number
 *         mao_obra:
 *           type: number
 *         outros:
 *           type: number
 *         rendimento:
 *           type: number
 *         unidade_rendimento:
 *           type: string
 *         margem_lucro:
 *           type: number
 *         custo_total:
 *           type: number
 *         custo_por_unidade:
 *           type: number
 *         preco_venda_sugerido:
 *           type: number
 *         ativo:
 *           type: boolean
 */

const ingredienteFichaSchema = new mongoose.Schema({
  ingrediente_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingrediente',
    required: [true, 'ID do ingrediente é obrigatório']
  },
  nome: {
    type: String,
    required: [true, 'Nome do ingrediente é obrigatório']
  },
  quantidade_usada: {
    type: Number,
    required: [true, 'Quantidade usada é obrigatória'],
    min: [0, 'Quantidade usada deve ser maior que zero']
  },
  unidade: {
    type: String,
    required: [true, 'Unidade é obrigatória']
  },
  preco_unitario: {
    type: Number,
    required: [true, 'Preço unitário é obrigatório'],
    min: [0, 'Preço unitário deve ser maior que zero']
  },
  peso_compra: {
    type: Number,
    required: [true, 'Peso de compra é obrigatório'],
    min: [0, 'Peso de compra deve ser maior que zero']
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
});

const fichaTecnicaSchema = new mongoose.Schema({
  nome_receita: {
    type: String,
    required: [true, 'Nome da receita é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome da receita não pode ter mais de 200 caracteres']
  },
  ingredientes: {
    type: [ingredienteFichaSchema],
    required: [true, 'Pelo menos um ingrediente é obrigatório'],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Pelo menos um ingrediente é obrigatório'
    }
  },
  gas_energia: {
    type: Number,
    required: [true, 'Custo de gás/energia é obrigatório'],
    min: [0, 'Custo de gás/energia não pode ser negativo'],
    default: 0
  },
  embalagem: {
    type: Number,
    required: [true, 'Custo de embalagem é obrigatório'],
    min: [0, 'Custo de embalagem não pode ser negativo'],
    default: 0
  },
  mao_obra: {
    type: Number,
    required: [true, 'Custo de mão de obra é obrigatório'],
    min: [0, 'Custo de mão de obra não pode ser negativo'],
    default: 0
  },
  outros: {
    type: Number,
    required: [true, 'Outros custos é obrigatório'],
    min: [0, 'Outros custos não pode ser negativo'],
    default: 0
  },
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
  margem_lucro: {
    type: Number,
    required: [true, 'Margem de lucro é obrigatória'],
    min: [0, 'Margem de lucro não pode ser negativa']
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
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
fichaTecnicaSchema.index({ nome_receita: 'text' });
fichaTecnicaSchema.index({ ativo: 1 });

module.exports = mongoose.model('FichaTecnica', fichaTecnicaSchema);
