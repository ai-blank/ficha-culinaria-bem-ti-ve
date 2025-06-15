
const express = require('express');
const { body } = require('express-validator');
const fichaController = require('../controllers/fichaController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /fichas:
 *   get:
 *     summary: Lista fichas técnicas
 *     tags: [Fichas Técnicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome da receita
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
 *         description: Lista de fichas técnicas
 */
router.get('/', auth, fichaController.getFichas);

/**
 * @swagger
 * /fichas/{id}:
 *   get:
 *     summary: Obtém uma ficha técnica específica
 *     tags: [Fichas Técnicas]
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
 *         description: Ficha técnica encontrada
 *       404:
 *         description: Ficha técnica não encontrada
 */
router.get('/:id', auth, fichaController.getFichaById);

/**
 * @swagger
 * /fichas:
 *   post:
 *     summary: Cria nova ficha técnica
 *     tags: [Fichas Técnicas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FichaTecnica'
 *     responses:
 *       201:
 *         description: Ficha técnica criada com sucesso
 */
router.post('/', auth, [
  body('nome_receita').trim().isLength({ min: 2 }).withMessage('Nome da receita deve ter pelo menos 2 caracteres'),
  body('ingredientes').isArray({ min: 1 }).withMessage('Pelo menos um ingrediente é obrigatório'),
  body('rendimento').isNumeric().withMessage('Rendimento deve ser um número'),
  body('unidade_rendimento').trim().notEmpty().withMessage('Unidade de rendimento é obrigatória'),
  body('margem_lucro').isNumeric().withMessage('Margem de lucro deve ser um número')
], fichaController.createFicha);

/**
 * @swagger
 * /fichas/{id}:
 *   patch:
 *     summary: Atualiza ficha técnica
 *     tags: [Fichas Técnicas]
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
 *         description: Ficha técnica atualizada
 */
router.patch('/:id', auth, fichaController.updateFicha);

/**
 * @swagger
 * /fichas/{id}/status:
 *   patch:
 *     summary: Ativa/desativa ficha técnica
 *     tags: [Fichas Técnicas]
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
 *         description: Status da ficha técnica atualizado
 */
router.patch('/:id/status', auth, fichaController.updateFichaStatus);

/**
 * @swagger
 * /fichas/{id}/clonar:
 *   post:
 *     summary: Clona uma ficha técnica
 *     tags: [Fichas Técnicas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Ficha técnica clonada com sucesso
 */
router.post('/:id/clonar', auth, fichaController.clonarFicha);

module.exports = router;
