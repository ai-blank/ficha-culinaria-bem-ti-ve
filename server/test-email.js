
const sendEmail = require('./src/services/emailService');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('🔄 Testando envio de email...');
    console.log('📧 Configurações:');
    console.log('- Host:', process.env.EMAIL_HOST);
    console.log('- Port:', process.env.EMAIL_PORT);
    console.log('- User:', process.env.EMAIL_USER);
    console.log('- From:', process.env.EMAIL_FROM);
    
    await sendEmail({
      email: 'seu-email@exemplo.com', // Substitua pelo seu email
      subject: 'Teste de Email - Bem Ti Vê',
      message: 'Este é um teste do servidor de email! Se você recebeu esta mensagem, o servidor está funcionando corretamente.',
      html: `
        <h2>🎉 Teste de Email Bem-sucedido!</h2>
        <p>Este é um teste do servidor de email do sistema <strong>Bem Ti Vê</strong>.</p>
        <p>Se você recebeu esta mensagem, significa que:</p>
        <ul>
          <li>✅ As configurações de email estão corretas</li>
          <li>✅ A autenticação com o Gmail está funcionando</li>
          <li>✅ O servidor pode enviar emails com sucesso</li>
        </ul>
        <p><em>Enviado em: ${new Date().toLocaleString('pt-BR')}</em></p>
      `
    });
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log('📬 Verifique sua caixa de entrada (e spam)');
    
  } catch (error) {
    console.error('❌ Erro ao enviar email de teste:');
    console.error('Tipo do erro:', error.name);
    console.error('Mensagem:', error.message);
    
    if (error.code) {
      console.error('Código:', error.code);
    }
    
    // Sugestões baseadas no tipo de erro
    if (error.message.includes('authentication') || error.message.includes('Authentication')) {
      console.log('\n💡 Dicas para resolver erro de autenticação:');
      console.log('1. Verifique se EMAIL_USER e EMAIL_PASS estão corretos no .env');
      console.log('2. Confirme se a senha de app do Gmail está ativa');
      console.log('3. Verifique se a autenticação de 2 fatores está habilitada');
    }
    
    if (error.message.includes('timeout') || error.message.includes('connection')) {
      console.log('\n💡 Dicas para resolver erro de conexão:');
      console.log('1. Verifique sua conexão com a internet');
      console.log('2. Confirme se EMAIL_HOST e EMAIL_PORT estão corretos');
      console.log('3. Verifique se não há firewall bloqueando a porta 587');
    }
  }
  
  process.exit(0);
}

console.log('🚀 Iniciando teste de email...');
testEmail();
