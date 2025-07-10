
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - password
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', [
  body('nome').trim().isLength({ min: 2 }).withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Faz login do usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
], authController.login);

/**
 * @swagger
 * /auth/confirm:
 *   post:
 *     summary: Confirma email do usuário
 *     tags: [Autenticação]
 */
router.post('/confirm', authController.confirmEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicita redefinição de senha
 *     tags: [Autenticação]
 */
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Email inválido')
], authController.forgotPassword);

/**
 * @swagger
 * /auth/validate-reset-token:
 *   post:
 *     summary: Valida token de redefinição de senha
 *     tags: [Autenticação]
 */
router.post('/validate-reset-token', [
  body('token').notEmpty().withMessage('Token é obrigatório')
], authController.validateResetToken);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefine senha com token
 *     tags: [Autenticação]
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token é obrigatório'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], authController.resetPassword);

/**
 * @swagger
 * /auth/resend-confirmation:
 *   post:
 *     summary: Reenvia email de confirmação
 *     tags: [Autenticação]
 */
router.post('/resend-confirmation', [
  body('email').isEmail().withMessage('Email inválido')
], authController.resendConfirmation);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Obtém dados do usuário logado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', auth, authController.getMe);

module.exports = router;
