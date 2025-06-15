
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

// CORS configurado com padrões dinâmicos
const corsOptions = {
  origin: function (origin, callback) {
    console.log(`🌍 Verificando origin: ${origin}`);
    
    // Permitir requests sem origin (ex: aplicações mobile ou Postman)
    if (!origin) {
      console.log('✅ Origin vazio - permitido');
      return callback(null, true);
    }

    // Lista de origins permitidos
    const allowedOrigins = [
      'http://localhost:8080',
      'https://cfa6ee5c-2b8a-424b-91c6-d147cfb1087e.lovableproject.com',
      process.env.FRONTEND_URL || 'http://localhost:8080'
    ];

    // Verificar origins exatos
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin exato encontrado - permitido');
      return callback(null, true);
    }

    // Permitir qualquer subdomínio do Lovable
    if (origin.includes('lovableproject.com') || origin.includes('lovable.app')) {
      console.log('✅ Domínio Lovable detectado - permitido');
      return callback(null, true);
    }

    // Permitir IPs locais na porta 8080 (ex: 192.168.x.x:8080)
    const localIpPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):8080$/;
    if (localIpPattern.test(origin)) {
      console.log('✅ IP local detectado - permitido');
      return callback(null, true);
    }

    console.log(`❌ Origin não permitido: ${origin}`);
    callback(new Error('Não permitido pelo CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middleware adicional para debug e configuração manual de headers
app.use((req, res, next) => {
  const origin = req.get('Origin');
  
  console.log(`📡 ${req.method} ${req.path}`);
  console.log(`🌍 Origin: ${origin}`);
  console.log(`🔑 User-Agent: ${req.get('User-Agent')}`);
  
  // Configurar headers CORS manualmente para garantir compatibilidade
  if (origin) {
    // Verificar se o origin é permitido usando a mesma lógica do corsOptions
    const allowedOrigins = [
      'http://localhost:8080',
      'https://cfa6ee5c-2b8a-424b-91c6-d147cfb1087e.lovableproject.com',
      process.env.FRONTEND_URL || 'http://localhost:8080'
    ];

    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.includes('lovableproject.com') || 
                     origin.includes('lovable.app') ||
                     /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+):8080$/.test(origin);

    if (isAllowed) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept, Origin');
      console.log(`✅ Headers CORS configurados para: ${origin}`);
    } else {
      console.log(`❌ Origin rejeitado nos headers: ${origin}`);
    }
  }
  
  // Responder a requisições OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('🔄 Respondendo OPTIONS request');
    return res.status(200).end();
  }
  
  next();
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
    cors: 'enabled with dynamic origins'
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
  console.log(`🌍 CORS configurado dinamicamente para:`);
  console.log(`   - localhost:8080`);
  console.log(`   - Domínios Lovable (*.lovableproject.com, *.lovable.app)`);
  console.log(`   - IPs locais na porta 8080 (192.168.x.x:8080, etc.)`);
});

module.exports = app;
