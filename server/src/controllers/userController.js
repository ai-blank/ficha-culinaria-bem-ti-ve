
const { validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Listar usuários
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Construir query de busca
    let query = {};
    if (search) {
      query = {
        $or: [
          { nome: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Configurar ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executar query com paginação
    const users = await User.find(query)
      .select('-password -tokenVerificacao -tokenResetSenha')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Contar total de documentos
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
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

// @desc    Atualizar usuário
// @route   PATCH /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { nome, email } = req.body;

    // Verificar se o usuário pode editar este perfil
    if (req.user._id.toString() !== id && !req.user.admin) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode editar seu próprio perfil.'
      });
    }

    // Verificar se o usuário existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o email já está em uso
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Atualizar usuário
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { nome, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: { user: updatedUser }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar status do usuário
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ativo } = req.body;

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Status ativo deve ser um valor booleano'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir desativar o próprio usuário admin
    if (req.user._id.toString() === id && !ativo) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar sua própria conta'
      });
    }

    user.ativo = ativo;
    await user.save();

    res.json({
      success: true,
      message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`,
      data: { 
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          ativo: user.ativo
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updateUser,
  updateUserStatus
};
