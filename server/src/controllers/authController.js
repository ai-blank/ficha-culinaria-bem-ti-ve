
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

    // Criar usuário INATIVO até confirmar email
    const user = await User.create({
      nome,
      email,
      password,
      tokenVerificacao: verificationToken,
      ativo: false // Usuário criado como INATIVO
    });

    // Enviar email de verificação
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: '🎉 Bem-vindo ao Bem Ti Vê!',
        message: `Olá ${nome}!\n\nSeja bem-vindo(a) ao sistema Bem Ti Vê! Para começar a usar todas as funcionalidades, você precisa verificar seu email.\n\nClique no botão abaixo para ativar sua conta:`,
        html: `
          <p>Olá <strong>${nome}</strong>!</p>
          
          <p>🎉 <strong>Seja bem-vindo(a) ao Bem Ti Vê!</strong></p>
          
          <p>Estamos muito felizes em tê-lo(a) conosco! O Bem Ti Vê é seu parceiro ideal para:</p>
          
          <ul style="color: #555; line-height: 1.8;">
            <li>🍽️ Criar e gerenciar fichas técnicas de pratos</li>
            <li>📊 Controlar custos e ingredientes</li>
            <li>📈 Otimizar sua gestão culinária</li>
            <li>🎯 Aumentar a eficiência da sua cozinha</li>
          </ul>
          
          <p>Para começar a usar todas essas funcionalidades, você só precisa verificar seu email clicando no botão abaixo:</p>
        `,
        buttonText: 'Verificar Email e Começar',
        buttonUrl: verificationUrl
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
          emailVerificado: user.emailVerificado,
          ativo: user.ativo // Será false
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
        message: 'Conta não ativada. Verifique seu email para ativar a conta.'
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

    // Ativar usuário e marcar email como verificado
    user.emailVerificado = true;
    user.ativo = true; // ATIVAR usuário após confirmação
    user.tokenVerificacao = undefined;
    await user.save();

    console.log(`✅ Usuário ${user.email} ativado com sucesso!`);

    res.json({
      success: true,
      message: 'Email verificado e conta ativada com sucesso'
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
        subject: '🔐 Redefinição de Senha - Bem Ti Vê',
        message: `Olá ${user.nome}!\n\nRecebemos uma solicitação para redefinir a senha da sua conta no Bem Ti Vê.\n\nSe foi você quem solicitou, clique no botão abaixo para criar uma nova senha:`,
        html: `
          <p>Olá <strong>${user.nome}</strong>!</p>
          
          <p>🔐 Recebemos uma solicitação para <strong>redefinir a senha</strong> da sua conta no Bem Ti Vê.</p>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec6d0b;">
            <p style="margin: 0; color: #e65100;">
              <strong>⚠️ Importante:</strong> Este link é válido por apenas 10 minutos por motivos de segurança.
            </p>
          </div>
          
          <p>Se foi você quem solicitou esta redefinição, clique no botão abaixo para criar uma nova senha:</p>
          
          <br>
          
          <p style="font-size: 14px; color: #666;">
            Se você não solicitou esta redefinição, pode ignorar este email com segurança. Sua conta permanecerá protegida.
          </p>
        `,
        buttonText: 'Redefinir Minha Senha',
        buttonUrl: resetUrl
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

// @desc    Validar token de reset
// @route   POST /api/auth/validate-reset-token
// @access  Public
const validateResetToken = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Token é obrigatório',
        errors: errors.array()
      });
    }

    const { token } = req.body;

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

    res.json({
      success: true,
      message: 'Token válido'
    });

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

// @desc    Reenviar email de confirmação
// @route   POST /api/auth/resend-confirmation
// @access  Public
const resendConfirmation = async (req, res, next) => {
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

    if (user.emailVerificado) {
      return res.status(400).json({
        success: false,
        message: 'Email já foi verificado'
      });
    }

    // Gerar novo token de verificação
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.tokenVerificacao = verificationToken;
    await user.save();

    // Enviar email de verificação
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/confirm-email?token=${verificationToken}`;
      await sendEmail({
        email: user.email,
        subject: '🎉 Confirmação de Email - Bem Ti Vê',
        message: `Olá ${user.nome}!\n\nConforme solicitado, aqui está um novo link para verificar seu email no Bem Ti Vê.\n\nClique no botão abaixo para ativar sua conta:`,
        html: `
          <p>Olá <strong>${user.nome}</strong>!</p>
          
          <p>🎉 Conforme solicitado, aqui está um novo link para <strong>verificar seu email</strong> no Bem Ti Vê!</p>
          
          <p>Para começar a usar todas as funcionalidades do sistema, você só precisa clicar no botão abaixo:</p>
          
          <ul style="color: #555; line-height: 1.8;">
            <li>🍽️ Criar e gerenciar fichas técnicas de pratos</li>
            <li>📊 Controlar custos e ingredientes</li>
            <li>📈 Otimizar sua gestão culinária</li>
            <li>🎯 Aumentar a eficiência da sua cozinha</li>
          </ul>
        `,
        buttonText: 'Verificar Email e Começar',
        buttonUrl: verificationUrl
      });

      res.json({
        success: true,
        message: 'Email de confirmação reenviado com sucesso'
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email de confirmação'
      });
    }

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
  validateResetToken,
  resetPassword,
  resendConfirmation,
  getMe
};
