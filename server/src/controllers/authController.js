
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../services/emailService');

// Gerar JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Registrar usuário
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

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      password,
      tokenVerificacao: verificationToken
    });

    // Enviar email de verificação
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Verificação de Email - Ficha Técnica',
        message: `Por favor, clique no link para verificar seu email: ${verificationUrl}`
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Continue mesmo se o email falhar
    }

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso. Verifique seu email para ativar a conta.',
      data: {
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          admin: user.admin,
          emailVerificado: user.emailVerificado
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Login do usuário
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

    // Verificar se usuário existe
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se usuário está ativo
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          admin: user.admin,
          emailVerificado: user.emailVerificado
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Confirmar email
// @route   POST /api/auth/confirm
// @access  Public
const confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação é obrigatório'
      });
    }

    const user = await User.findOne({ tokenVerificacao: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação inválido'
      });
    }

    user.emailVerificado = true;
    user.tokenVerificacao = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verificado com sucesso'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Esqueci minha senha
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.tokenResetSenha = resetToken;
    user.tokenResetExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

    await user.save();

    // Enviar email
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        email: user.email,
        subject: 'Redefinição de Senha - Ficha Técnica',
        message: `Você solicitou a redefinição de senha. Clique no link: ${resetUrl}`
      });

      res.json({
        success: true,
        message: 'Email de redefinição enviado'
      });
    } catch (emailError) {
      user.tokenResetSenha = undefined;
      user.tokenResetExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email'
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Redefinir senha
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      tokenResetSenha: token,
      tokenResetExpire: { $gt: Date.now() }
    });

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

// @desc    Obter dados do usuário atual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          admin: user.admin,
          emailVerificado: user.emailVerificado,
          ativo: user.ativo
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  confirmEmail,
  forgotPassword,
  resetPassword,
  getMe
};
