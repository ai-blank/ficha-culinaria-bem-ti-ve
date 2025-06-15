
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ingredienteRoutes = require('./routes/ingredientes');
const fichaRoutes = require('./routes/fichas');
const alimentoRoutes = require('./routes/alimentos');
const swaggerSetup = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middleware de segurança
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

// CORS configurado com logs melhorados
const corsOptions = {
  origin: [
    'http://localhost:8080',
    'https://cfa6ee5c-2b8a-424b-91c6-d147cfb1087e.lovableproject.com',
    process.env.FRONTEND_URL || 'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Log detalhado para debug de CORS
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path}`);
  console.log(`🌍 Origin: ${req.get('Origin')}`);
  console.log(`🔑 Headers: ${JSON.stringify(req.headers)}`);
  
  // Adicionar headers CORS manualmente se necessário
  const origin = req.get('Origin');
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
  }
  
  if (req.method === 'OPTIONS') {
    console.log('🔄 Respondendo OPTIONS request');
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP por janela de tempo
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configurar Swagger
swaggerSetup(app);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingredientes', ingredienteRoutes);
app.use('/api/fichas', fichaRoutes);
app.use('/api/alimentos', alimentoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: 'enabled'
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Rota não encontrada' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
  console.log(`🌍 CORS configurado para:`);
  corsOptions.origin.forEach(origin => console.log(`   - ${origin}`));
});

module.exports = app;
