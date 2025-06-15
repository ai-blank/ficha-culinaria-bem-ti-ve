
const { validationResult } = require('express-validator');
const Ingrediente = require('../models/Ingrediente');

// @desc    Listar ingredientes
// @route   GET /api/ingredientes
// @access  Private
const getIngredientes = async (req, res, next) => {
  try {
    const { 
      search, 
      categoria, 
      ativo, 
      page = 1, 
      limit = 10, 
      sortBy = 'alimento', 
      sortOrder = 'asc' 
    } = req.query;

    // Construir query de busca
    let query = {};

    if (search) {
      query.$or = [
        { alimento: { $regex: search, $options: 'i' } },
        { categoria: { $regex: search, $options: 'i' } },
        { fornecedor: { $regex: search, $options: 'i' } }
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
    const ingredientes = await Ingrediente.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Contar total de documentos
    const total = await Ingrediente.countDocuments(query);

    res.json({
      success: true,
      data: {
        ingredientes,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalItems: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar ingredientes:', error);
    next(error);
  }
};

// @desc    Obter ingrediente por ID
// @route   GET /api/ingredientes/:id
// @access  Private
const getIngredienteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ingrediente = await Ingrediente.findById(id);

    if (!ingrediente) {
      return res.status(404).json({
        success: false,
        message: 'Ingrediente não encontrado'
      });
    }

    res.json({
      success: true,
      data: { ingrediente }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar ingrediente:', error);
    next(error);
  }
};

// @desc    Criar ingrediente
// @route   POST /api/ingredientes
// @access  Private
const createIngrediente = async (req, res, next) => {
  try {
    console.log('📝 Dados recebidos para criar ingrediente:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erros de validação:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Verificar se o alimento já existe
    const alimentoExistente = await Ingrediente.findOne({ 
      alimento: { $regex: new RegExp(`^${req.body.alimento}$`, 'i') }
    });

    if (alimentoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um ingrediente com este nome'
      });
    }

    const ingrediente = await Ingrediente.create(req.body);
    console.log('✅ Ingrediente criado com sucesso:', ingrediente);

    res.status(201).json({
      success: true,
      message: 'Ingrediente criado com sucesso',
      data: { ingrediente }
    });

  } catch (error) {
    console.error('❌ Erro ao criar ingrediente:', error);
    next(error);
  }
};

// @desc    Atualizar ingrediente
// @route   PATCH /api/ingredientes/:id
// @access  Private
const updateIngrediente = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('📝 Atualizando ingrediente:', id, req.body);

    const ingrediente = await Ingrediente.findById(id);
    if (!ingrediente) {
      return res.status(404).json({
        success: false,
        message: 'Ingrediente não encontrado'
      });
    }

    // Se está alterando o nome, verificar duplicatas
    if (req.body.alimento && req.body.alimento !== ingrediente.alimento) {
      const alimentoExistente = await Ingrediente.findOne({ 
        alimento: { $regex: new RegExp(`^${req.body.alimento}$`, 'i') },
        _id: { $ne: id }
      });

      if (alimentoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um ingrediente com este nome'
        });
      }
    }

    const updatedIngrediente = await Ingrediente.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log('✅ Ingrediente atualizado:', updatedIngrediente);

    res.json({
      success: true,
      message: 'Ingrediente atualizado com sucesso',
      data: { ingrediente: updatedIngrediente }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar ingrediente:', error);
    next(error);
  }
};

// @desc    Atualizar status do ingrediente
// @route   PATCH /api/ingredientes/:id/status
// @access  Private
const updateIngredienteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status ativo deve ser um valor booleano'
      });
    }

    const ingrediente = await Ingrediente.findById(id);
    if (!ingrediente) {
      return res.status(404).json({
        success: false,
        message: 'Ingrediente não encontrado'
      });
    }

    ingrediente.ativo = ativo;
    await ingrediente.save();

    console.log('✅ Status do ingrediente atualizado:', ingrediente);

    res.json({
      success: true,
      message: `Ingrediente ${ativo ? 'ativado' : 'desativado'} com sucesso`,
      data: { ingrediente }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    next(error);
  }
};

module.exports = {
  getIngredientes,
  getIngredienteById,
  createIngrediente,
  updateIngrediente,
  updateIngredienteStatus
};
