
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
      email: 'contato.alexblank@gmail.com', // Substitua pelo seu email
      subject: '🎉 Teste do Sistema Bem Ti Vê',
      message: 'Este é um teste do servidor de email!\n\nSe você recebeu esta mensagem, o servidor está funcionando corretamente.\n\nTodos os recursos estão operacionais.',
      html: `
        <p>🎉 <strong>Teste do Sistema Bem Ti Vê realizado com sucesso!</strong></p>
        
        <p>Este é um teste do servidor de email do sistema. Se você recebeu esta mensagem, significa que:</p>
        
        <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <ul style="margin: 0; color: #2e7d32;">
            <li>✅ As configurações de email estão corretas</li>
            <li>✅ A autenticação com o Gmail está funcionando</li>
            <li>✅ O servidor pode enviar emails com sucesso</li>
            <li>✅ Os templates HTML estão sendo aplicados</li>
          </ul>
        </div>
        
        <p>🚀 O sistema está pronto para uso em produção!</p>
        
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #e65100;">
          <strong>📅 Dados do teste:</strong><br>
          • Timestamp: ${new Date().toLocaleString('pt-BR')}<br>
          • Servidor: ${process.env.EMAIL_HOST}<br>
          • Versão: 2.0 com templates Bem Ti Vê
        </div>
      `,
      buttonText: 'Acessar Sistema',
      buttonUrl: process.env.FRONTEND_URL || 'https://localhost:8080'
    });
    
    console.log('✅ Email de teste enviado com sucesso!');
    console.log('📬 Verifique sua caixa de entrada (e spam)');
    console.log('🎨 O email agora inclui o design da marca Bem Ti Vê!');
    
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

console.log('🚀 Iniciando teste de email com novo design Bem Ti Vê...');
testEmail();
