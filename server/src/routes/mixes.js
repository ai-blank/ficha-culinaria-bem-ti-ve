
const express = require('express');
const { body } = require('express-validator');
const mixController = require('../controllers/mixController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /mixes:
 *   get:
 *     summary: Lista mixes
 *     tags: [Mixes]
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
 *         description: Lista de mixes
 */
router.get('/', auth, mixController.getMixes);

/**
 * @swagger
 * /mixes/{id}:
 *   get:
 *     summary: Obtém um mix específico
 *     tags: [Mixes]
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
 *         description: Mix encontrado
 *       404:
 *         description: Mix não encontrado
 */
router.get('/:id', auth, mixController.getMixById);

/**
 * @swagger
 * /mixes:
 *   post:
 *     summary: Cria novo mix
 *     tags: [Mixes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Mix'
 *     responses:
 *       201:
 *         description: Mix criado com sucesso
 */
router.post('/', auth, [
  body('nome').trim().isLength({ min: 2 }).withMessage('Nome do mix deve ter pelo menos 2 caracteres'),
  body('ingredientes').isArray({ min: 1 }).withMessage('Deve ter pelo menos um ingrediente'),
  body('categoria').trim().notEmpty().withMessage('Categoria é obrigatória'),
  body('peso_total').trim().notEmpty().withMessage('Peso total é obrigatório'),
  body('unidade').trim().notEmpty().withMessage('Unidade é obrigatória')
], mixController.createMix);

/**
 * @swagger
 * /mixes/{id}:
 *   patch:
 *     summary: Atualiza mix
 *     tags: [Mixes]
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
 *         description: Mix atualizado
 */
router.patch('/:id', auth, mixController.updateMix);

/**
 * @swagger
 * /mixes/{id}/status:
 *   patch:
 *     summary: Ativa/desativa mix
 *     tags: [Mixes]
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
 *         description: Status do mix atualizado
 */
router.patch('/:id/status', auth, mixController.updateMixStatus);

module.exports = router;
