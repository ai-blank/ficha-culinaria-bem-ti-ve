
const express = require('express');
const { body } = require('express-validator');
const ingredienteController = require('../controllers/ingredienteController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /ingredientes:
 *   get:
 *     summary: Lista ingredientes
 *     tags: [Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome ou categoria
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: ativo
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items por página
 *     responses:
 *       200:
 *         description: Lista de ingredientes
 */
router.get('/', auth, ingredienteController.getIngredientes);

/**
 * @swagger
 * /ingredientes/{id}:
 *   get:
 *     summary: Obtém um ingrediente específico
 *     tags: [Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingrediente encontrado
 *       404:
 *         description: Ingrediente não encontrado
 */
router.get('/:id', auth, ingredienteController.getIngredienteById);

/**
 * @swagger
 * /ingredientes:
 *   post:
 *     summary: Cria novo ingrediente
 *     tags: [Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ingrediente'
 *     responses:
 *       201:
 *         description: Ingrediente criado com sucesso
 */
router.post('/', auth, [
  body('alimento').trim().isLength({ min: 2 }).withMessage('Nome do alimento deve ter pelo menos 2 caracteres'),
  body('peso').isNumeric().withMessage('Peso deve ser um número'),
  body('preco').isNumeric().withMessage('Preço deve ser um número'),
  body('unidade').trim().notEmpty().withMessage('Unidade é obrigatória'),
  body('fator_correcao').isNumeric().withMessage('Fator de correção deve ser um número'),
  body('categoria').trim().notEmpty().withMessage('Categoria é obrigatória')
], ingredienteController.createIngrediente);

/**
 * @swagger
 * /ingredientes/{id}:
 *   patch:
 *     summary: Atualiza ingrediente
 *     tags: [Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingrediente atualizado
 */
router.patch('/:id', auth, ingredienteController.updateIngrediente);

/**
 * @swagger
 * /ingredientes/{id}/status:
 *   patch:
 *     summary: Ativa/desativa ingrediente
 *     tags: [Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status do ingrediente atualizado
 */
router.patch('/:id/status', auth, ingredienteController.updateIngredienteStatus);

module.exports = router;
