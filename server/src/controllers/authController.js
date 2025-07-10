const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { nome, email, password } = req.body;

    // Verificar se o email já existe
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Criar token de verificação
    const tokenVerificacao = crypto.randomBytes(20).toString('hex');

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      password,
      tokenVerificacao
    });

    // Criar token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    // Enviar email de verificação
    const confirmLink = `${req.protocol}://${req.get('host')}/api/auth/confirm-email?token=${tokenVerificacao}`;
    const message = `
      <p>Por favor, clique neste link para confirmar seu email:</p>
      <a href="${confirmLink}" target="_blank">Confirmar Email</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Confirmação de Email',
        text: message
      });

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso. Verifique seu email para confirmar sua conta.',
        data: {
          user: {
            id: user._id,
            nome: user.nome,
            email: user.email
          },
          token: token
        }
      });

    } catch (error) {
      // Rollback: Excluir usuário se falhar ao enviar email
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email de confirmação. Tente novamente.'
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Fazer login do usuário
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se a senha está correta
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se o email foi confirmado
    if (!user.emailVerificado) {
      return res.status(401).json({
        success: false,
        message: 'Email não confirmado. Verifique sua caixa de entrada.'
      });
    }

    // Verificar se o usuário está ativo
    if (!user.ativo) {
      return res.status(403).json({
        success: false,
        message: 'Usuário inativo. Contacte o administrador.'
      });
    }

    // Criar token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          admin: user.admin,
          ativo: user.ativo,
          emailVerificado: user.emailVerificado,
          createdAt: user.createdAt,
          company: user.company,
          phone: user.phone
        },
        token: token
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Confirmar email do usuário
// @route   GET /api/auth/confirm-email
// @access  Public
const confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({ tokenVerificacao: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido'
      });
    }

    user.emailVerificado = true;
    user.ativo = true; // Ativar usuário após confirmação
    user.tokenVerificacao = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email confirmado com sucesso. Agora você pode fazer login.'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Reenviar email de confirmação
// @route   POST /api/auth/resend-confirmation
// @access  Public
const resendConfirmation = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o email já foi confirmado
    if (user.emailVerificado) {
      return res.status(400).json({
        success: false,
        message: 'Este email já foi confirmado'
      });
    }

    // Criar novo token de verificação
    user.tokenVerificacao = crypto.randomBytes(20).toString('hex');
    await user.save();

    // Enviar email de verificação
    const confirmLink = `${req.protocol}://${req.get('host')}/api/auth/confirm-email?token=${user.tokenVerificacao}`;
    const message = `
      <p>Por favor, clique neste link para confirmar seu email:</p>
      <a href="${confirmLink}" target="_blank">Confirmar Email</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Confirmação de Email',
      text: message
    });

    res.json({
      success: true,
      message: 'Email de confirmação reenviado com sucesso. Verifique sua caixa de entrada.'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Solicitar redefinição de senha
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Criar token de redefinição
    const tokenResetSenha = crypto.randomBytes(20).toString('hex');
    user.tokenResetSenha = crypto.createHash('sha256').update(tokenResetSenha).digest('hex');
    user.tokenResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
    await user.save();

    // Enviar email de redefinição
    const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${tokenResetSenha}`;
    const message = `
      <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para redefinir:</p>
      <a href="${resetLink}" target="_blank">Redefinir Senha</a>
      <p>Este link é válido por 10 minutos.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Redefinição de Senha',
        text: message
      });

      res.json({
        success: true,
        message: 'Email de redefinição enviado com sucesso. Verifique sua caixa de entrada.'
      });

    } catch (error) {
      // Limpar campos de redefinição se falhar ao enviar email
      user.tokenResetSenha = undefined;
      user.tokenResetExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email de redefinição. Tente novamente.'
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Validar token de redefinição de senha
// @route   POST /api/auth/validate-reset-token
// @access  Public
const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      tokenResetSenha: tokenHash,
      tokenResetExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Redefinir senha do usuário
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      tokenResetSenha: tokenHash,
      tokenResetExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    user.password = password;
    user.tokenResetSenha = undefined;
    user.tokenResetExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Alterar senha do usuário logado
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Buscar usuário com senha
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  confirmEmail,
  resendConfirmation,
  forgotPassword,
  validateResetToken,
  resetPassword,
  changePassword
};
