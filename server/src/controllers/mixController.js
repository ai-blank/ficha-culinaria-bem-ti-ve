
const { validationResult } = require('express-validator');
const Mix = require('../models/Mix');
const Ingrediente = require('../models/Ingrediente');

// @desc    Listar mixes
// @route   GET /api/mixes
// @access  Private
const getMixes = async (req, res, next) => {
  try {
    const { 
      search, 
      categoria, 
      ativo, 
      page = 1, 
      limit = 10, 
      sortBy = 'nome', 
      sortOrder = 'asc' 
    } = req.query;

    // Construir query de busca
    let query = {};

    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { categoria: { $regex: search, $options: 'i' } },
        { descricao: { $regex: search, $options: 'i' } }
      ];
    }

    if (categoria) {
      query.categoria = { $regex: categoria, $options: 'i' };
    }

    if (ativo !== undefined) {
      query.ativo = ativo === 'true';
    }

    // Configurar ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executar query com paginação
    const mixes = await Mix.find(query)
      .populate('ingredientes.ingredienteId', 'alimento unidade preco')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Contar total de documentos
    const total = await Mix.countDocuments(query);

    res.json({
      success: true,
      data: {
        mixes,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalItems: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar mixes:', error);
    next(error);
  }
};

// @desc    Obter mix por ID
// @route   GET /api/mixes/:id
// @access  Private
const getMixById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mix = await Mix.findById(id).populate('ingredientes.ingredienteId', 'alimento unidade preco');

    if (!mix) {
      return res.status(404).json({
        success: false,
        message: 'Mix não encontrado'
      });
    }

    res.json({
      success: true,
      data: { mix }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar mix:', error);
    next(error);
  }
};

// @desc    Criar mix
// @route   POST /api/mixes
// @access  Private
const createMix = async (req, res, next) => {
  try {
    console.log('📝 Dados recebidos para criar mix:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erros de validação:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Verificar se o mix já existe
    const mixExistente = await Mix.findOne({ 
      nome: { $regex: new RegExp(`^${req.body.nome}$`, 'i') }
    });

    if (mixExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um mix com este nome'
      });
    }

    // Validar ingredientes
    const { ingredientes } = req.body;
    for (const item of ingredientes) {
      const ingrediente = await Ingrediente.findById(item.ingredienteId);
      if (!ingrediente) {
        return res.status(400).json({
          success: false,
          message: `Ingrediente com ID ${item.ingredienteId} não encontrado`
        });
      }
    }

    // Calcular preço total e fator de correção médio
    let precoTotal = 0;
    let fatoresCorrecao = [];

    for (const item of ingredientes) {
      const ingrediente = await Ingrediente.findById(item.ingredienteId);
      precoTotal += ingrediente.preco * item.quantidade;
      fatoresCorrecao.push(ingrediente.fator_correcao);
    }

    const fatorCorrecaoMedio = fatoresCorrecao.reduce((acc, fc) => acc + fc, 0) / fatoresCorrecao.length;

    const dadosMix = {
      ...req.body,
      preco_total: precoTotal,
      fator_correcao: fatorCorrecaoMedio
    };

    const mix = await Mix.create(dadosMix);
    console.log('✅ Mix criado com sucesso:', mix);

    res.status(201).json({
      success: true,
      message: 'Mix criado com sucesso',
      data: { mix }
    });

  } catch (error) {
    console.error('❌ Erro ao criar mix:', error);
    next(error);
  }
};

// @desc    Atualizar mix
// @route   PATCH /api/mixes/:id
// @access  Private
const updateMix = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('📝 Atualizando mix:', id, req.body);

    const mix = await Mix.findById(id);
    if (!mix) {
      return res.status(404).json({
        success: false,
        message: 'Mix não encontrado'
      });
    }

    // Se está alterando o nome, verificar duplicatas
    if (req.body.nome && req.body.nome !== mix.nome) {
      const mixExistente = await Mix.findOne({ 
        nome: { $regex: new RegExp(`^${req.body.nome}$`, 'i') },
        _id: { $ne: id }
      });

      if (mixExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um mix com este nome'
        });
      }
    }

    const updatedMix = await Mix.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ingredientes.ingredienteId', 'alimento unidade preco');

    console.log('✅ Mix atualizado:', updatedMix);

    res.json({
      success: true,
      message: 'Mix atualizado com sucesso',
      data: { mix: updatedMix }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar mix:', error);
    next(error);
  }
};

// @desc    Atualizar status do mix
// @route   PATCH /api/mixes/:id/status
// @access  Private
const updateMixStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status ativo deve ser um valor booleano'
      });
    }

    const mix = await Mix.findById(id);
    if (!mix) {
      return res.status(404).json({
        success: false,
        message: 'Mix não encontrado'
      });
    }

    mix.ativo = ativo;
    await mix.save();

    console.log('✅ Status do mix atualizado:', mix);

    res.json({
      success: true,
      message: `Mix ${ativo ? 'ativado' : 'desativado'} com sucesso`,
      data: { mix }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    next(error);
  }
};

module.exports = {
  getMixes,
  getMixById,
  createMix,
  updateMix,
  updateMixStatus
};
