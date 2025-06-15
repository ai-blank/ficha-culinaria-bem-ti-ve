
const express = require('express');
const alimentoController = require('../controllers/alimentoController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /alimentos:
 *   get:
 *     summary: Lista alimentos da base de dados
 *     tags: [Alimentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome do alimento
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
 *         description: Lista de alimentos
 */
router.get('/', auth, alimentoController.getAlimentos);

/**
 * @swagger
 * /alimentos/categorias:
 *   get:
 *     summary: Lista categorias de alimentos
 *     tags: [Alimentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/categorias', auth, alimentoController.getCategorias);

module.exports = router;
