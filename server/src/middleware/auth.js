
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Token não fornecido.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Usuário não encontrado.'
      });
    }

    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Faça login novamente.'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Token inválido.'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.admin) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Privilégios de administrador necessários.'
        });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.'
    });
  }
};

module.exports = { auth, adminAuth };
