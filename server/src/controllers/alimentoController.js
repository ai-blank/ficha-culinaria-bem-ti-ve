
const fs = require('fs').promises;
const path = require('path');

// @desc    Listar alimentos da base de dados
// @route   GET /api/alimentos
// @access  Private
const getAlimentos = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    // Ler arquivo de base de alimentos
    const alimentosPath = path.join(__dirname, '../../data/tabela_fator_correcao_completa.json');
    const alimentosData = await fs.readFile(alimentosPath, 'utf8');
    let alimentos = JSON.parse(alimentosData);

    // Filtrar se houver busca
    if (search) {
      alimentos = alimentos.filter(alimento => 
        alimento.alimento.toLowerCase().includes(search.toLowerCase()) ||
        alimento.categoria.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedAlimentos = alimentos.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        alimentos: paginatedAlimentos,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(alimentos.length / limit),
          totalItems: alimentos.length,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Listar categorias de alimentos
// @route   GET /api/alimentos/categorias
// @access  Private
const getCategorias = async (req, res, next) => {
  try {
    // Ler arquivo de categorias
    const categoriasPath = path.join(__dirname, '../../data/categorias.json');
    const categoriasData = await fs.readFile(categoriasPath, 'utf8');
    const categorias = JSON.parse(categoriasData);

    res.json({
      success: true,
      data: { categorias }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlimentos,
  getCategorias
};
