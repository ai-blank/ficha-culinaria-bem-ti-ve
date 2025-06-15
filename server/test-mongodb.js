
const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDB() {
  try {
    console.log('🔄 Testando conexão com MongoDB Atlas...');
    console.log('📊 Configurações:');
    console.log('- URI:', process.env.MONGODB_URI);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    // Tentar conectar
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB conectado com sucesso!');
    console.log('🌍 Host:', conn.connection.host);
    console.log('📂 Database:', conn.connection.name);
    
    // Testar operação simples
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📋 Collections encontradas:', collections.length);
    
    if (collections.length > 0) {
      console.log('📋 Nomes das collections:', collections.map(c => c.name));
    }
    
    console.log('🎉 Teste de MongoDB concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:');
    console.error('Tipo do erro:', error.name);
    console.error('Mensagem:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Dicas para resolver erro de autenticação:');
      console.log('1. Verifique se MONGODB_URI está correto no .env');
      console.log('2. Confirme usuário e senha no MongoDB Atlas');
      console.log('3. Verifique se o IP está liberado no MongoDB Atlas');
    }
    
    if (error.message.includes('timeout') || error.message.includes('connection')) {
      console.log('\n💡 Dicas para resolver erro de conexão:');
      console.log('1. Verifique sua conexão com a internet');
      console.log('2. Confirme se o cluster MongoDB Atlas está ativo');
      console.log('3. Verifique se não há firewall bloqueando a conexão');
    }
  }
  
  // Fechar conexão
  await mongoose.connection.close();
  console.log('🔌 Conexão MongoDB fechada');
  process.exit(0);
}

console.log('🚀 Iniciando teste de MongoDB...');
testMongoDB();
