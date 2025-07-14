
const { validationResult } = require('express-validator');
const FichaTecnica = require('../models/FichaTecnica');

// Função para calcular custos da ficha técnica
const calcularCustos = (ficha) => {
  // Calcular custo dos ingredientes
  const custoIngredientes = ficha.ingredientes.reduce((total, ingrediente) => {
    const custoIngrediente = (ingrediente.preco_unitario / ingrediente.peso_compra) * 
                            ingrediente.quantidade_usada * ingrediente.fator_correcao;
    ingrediente.custo_calculado = custoIngrediente;
    return total + custoIngrediente;
  }, 0);

  // Calcular custo total
  const custoTotal = custoIngredientes + 
                    ficha.gas_energia + 
                    ficha.embalagem + 
                    ficha.mao_obra + 
                    ficha.outros;

  // Calcular custo por unidade
  const custoPorUnidade = custoTotal / ficha.rendimento;

  // Calcular preço de venda sugerido
  const precoVendaSugerido = custoPorUnidade * (1 + ficha.margem_lucro / 100);

  return {
    custo_total: custoTotal,
    custo_por_unidade: custoPorUnidade,
    preco_venda_sugerido: precoVendaSugerido,
    detalhes_custos: {
      ingredientes: custoIngredientes,
      gas_energia: ficha.gas_energia,
      embalagem: ficha.embalagem,
      mao_obra: ficha.mao_obra,
      outros: ficha.outros
    }
  };
};

// @desc    Listar fichas técnicas
// @route   GET /api/fichas
// @access  Private
const getFichas = async (req, res, next) => {
  try {
    const { 
      search, 
      ativo, 
      page = 1, 
      limit = 10, 
      sortBy = 'nome_receita', 
      sortOrder = 'asc' 
    } = req.query;

    // Construir query de busca
    let query = {};

    if (search) {
      query.nome_receita = { $regex: search, $options: 'i' };
    }

    if (ativo !== undefined) {
      query.ativo = ativo === 'true';
    }

    // Configurar ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executar query com paginação
    const fichas = await FichaTecnica.find(query)
      .populate('ingredientes.ingrediente_id', 'alimento categoria')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Contar total de documentos
    const total = await FichaTecnica.countDocuments(query);

    res.json({
      success: true,
      data: {
        fichas,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalItems: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Obter ficha técnica por ID
// @route   GET /api/fichas/:id
// @access  Private
const getFichaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ficha = await FichaTecnica.findById(id)
      .populate('ingredientes.ingrediente_id', 'alimento categoria unidade peso preco');

    if (!ficha) {
      return res.status(404).json({
        success: false,
        message: 'Ficha técnica não encontrada'
      });
    }

    res.json({
      success: true,
      data: { ficha }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Criar ficha técnica
// @route   POST /api/fichas
// @access  Private
const createFicha = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Buscar dados dos ingredientes para salvar nome e unidade
    const Ingrediente = require('../models/Ingrediente');
    const Mix = require('../models/Mix');
    
    for (let i = 0; i < req.body.ingredientes.length; i++) {
      const ingrediente = req.body.ingredientes[i];
      
      // Buscar no modelo Ingrediente primeiro
      let dadosIngrediente = await Ingrediente.findById(ingrediente.ingrediente_id);
      
      // Se não encontrar, buscar no modelo Mix
      if (!dadosIngrediente) {
        dadosIngrediente = await Mix.findById(ingrediente.ingrediente_id);
      }
      
      if (dadosIngrediente) {
        // Adicionar nome e unidade ao ingrediente
        req.body.ingredientes[i].nome = dadosIngrediente.alimento || dadosIngrediente.nome;
        req.body.ingredientes[i].unidade = dadosIngrediente.unidade;
      }
    }

    // Calcular custos
    const resultadoCalculo = calcularCustos(req.body);

    // Criar ficha com custos calculados
    const fichaTecnica = await FichaTecnica.create({
      ...req.body,
      custo_total: resultadoCalculo.custo_total,
      custo_por_unidade: resultadoCalculo.custo_por_unidade,
      preco_venda_sugerido: resultadoCalculo.preco_venda_sugerido
    });

    // Buscar ficha criada com populate
    const fichaCompleta = await FichaTecnica.findById(fichaTecnica._id)
      .populate('ingredientes.ingrediente_id', 'alimento categoria');

    res.status(201).json({
      success: true,
      message: 'Ficha técnica criada com sucesso',
      data: { 
        ficha: fichaCompleta,
        calculo: resultadoCalculo
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar ficha técnica
// @route   PATCH /api/fichas/:id
// @access  Private
const updateFicha = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ficha = await FichaTecnica.findById(id);
    if (!ficha) {
      return res.status(404).json({
        success: false,
        message: 'Ficha técnica não encontrada'
      });
    }

    // Se há ingredientes sendo atualizados, buscar dados completos
    if (req.body.ingredientes) {
      const Ingrediente = require('../models/Ingrediente');
      const Mix = require('../models/Mix');
      
      for (let i = 0; i < req.body.ingredientes.length; i++) {
        const ingrediente = req.body.ingredientes[i];
        
        // Buscar no modelo Ingrediente primeiro
        let dadosIngrediente = await Ingrediente.findById(ingrediente.ingrediente_id);
        
        // Se não encontrar, buscar no modelo Mix
        if (!dadosIngrediente) {
          dadosIngrediente = await Mix.findById(ingrediente.ingrediente_id);
        }
        
        if (dadosIngrediente) {
          // Adicionar nome e unidade ao ingrediente
          req.body.ingredientes[i].nome = dadosIngrediente.alimento || dadosIngrediente.nome;
          req.body.ingredientes[i].unidade = dadosIngrediente.unidade;
        }
      }
    }

    // Calcular custos se houver dados de cálculo
    let dadosAtualizacao = req.body;
    if (req.body.ingredientes || req.body.gas_energia !== undefined || 
        req.body.embalagem !== undefined || req.body.mao_obra !== undefined || 
        req.body.outros !== undefined || req.body.rendimento !== undefined || 
        req.body.margem_lucro !== undefined) {
      
      const dadosCompletos = { ...ficha.toObject(), ...req.body };
      const resultadoCalculo = calcularCustos(dadosCompletos);
      
      dadosAtualizacao = {
        ...dadosAtualizacao,
        custo_total: resultadoCalculo.custo_total,
        custo_por_unidade: resultadoCalculo.custo_por_unidade,
        preco_venda_sugerido: resultadoCalculo.preco_venda_sugerido
      };
    }

    const updatedFicha = await FichaTecnica.findByIdAndUpdate(
      id,
      dadosAtualizacao,
      { new: true, runValidators: true }
    ).populate('ingredientes.ingrediente_id', 'alimento categoria');

    res.json({
      success: true,
      message: 'Ficha técnica atualizada com sucesso',
      data: { ficha: updatedFicha }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar status da ficha técnica
// @route   PATCH /api/fichas/:id/status
// @access  Private
const updateFichaStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status ativo deve ser um valor booleano'
      });
    }

    const ficha = await FichaTecnica.findById(id);
    if (!ficha) {
      return res.status(404).json({
        success: false,
        message: 'Ficha técnica não encontrada'
      });
    }

    ficha.ativo = ativo;
    await ficha.save();

    res.json({
      success: true,
      message: `Ficha técnica ${ativo ? 'ativada' : 'desativada'} com sucesso`,
      data: { ficha }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Clonar ficha técnica
// @route   POST /api/fichas/:id/clonar
// @access  Private
const clonarFicha = async (req, res, next) => {
  try {
    const { id } = req.params;

    const fichaOriginal = await FichaTecnica.findById(id);
    if (!fichaOriginal) {
      return res.status(404).json({
        success: false,
        message: 'Ficha técnica não encontrada'
      });
    }

    // Criar cópia da ficha
    const dadosFicha = fichaOriginal.toObject();
    delete dadosFicha._id;
    delete dadosFicha.createdAt;
    delete dadosFicha.updatedAt;
    delete dadosFicha.__v;

    // Alterar nome para indicar que é uma cópia
    dadosFicha.nome_receita = `${dadosFicha.nome_receita} - Cópia`;

    // Remover IDs dos ingredientes para criar novos
    dadosFicha.ingredientes = dadosFicha.ingredientes.map(ing => {
      const { _id, ...ingredienteSemId } = ing;
      return ingredienteSemId;
    });

    const novaFicha = await FichaTecnica.create(dadosFicha);

    // Buscar ficha criada com populate
    const fichaCompleta = await FichaTecnica.findById(novaFicha._id)
      .populate('ingredientes.ingrediente_id', 'alimento categoria');

    res.status(201).json({
      success: true,
      message: 'Ficha técnica clonada com sucesso',
      data: { ficha: fichaCompleta }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFichas,
  getFichaById,
  createFicha,
  updateFicha,
  updateFichaStatus,
  clonarFicha
};
