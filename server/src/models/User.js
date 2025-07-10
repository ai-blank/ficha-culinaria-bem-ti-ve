
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do usuário
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         company:
 *           type: string
 *           description: Empresa/Negócio do usuário
 *         phone:
 *           type: string
 *           description: Telefone do usuário
 *         admin:
 *           type: boolean
 *           default: false
 *           description: Se o usuário é administrador
 *         ativo:
 *           type: boolean
 *           default: false
 *           description: Se o usuário está ativo (só fica true após confirmar email)
 *         emailVerificado:
 *           type: boolean
 *           default: false
 *           description: Se o email foi verificado
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Email inválido'
    ]
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Nome da empresa não pode ter mais de 100 caracteres']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Telefone não pode ter mais de 20 caracteres']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false
  },
  admin: {
    type: Boolean,
    default: false
  },
  ativo: {
    type: Boolean,
    default: false // Usuário criado como INATIVO por padrão
  },
  emailVerificado: {
    type: Boolean,
    default: false
  },
  tokenVerificacao: String,
  tokenResetSenha: String,
  tokenResetExpire: Date
}, {
  timestamps: true
});

// Criptografar senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar senhas
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
