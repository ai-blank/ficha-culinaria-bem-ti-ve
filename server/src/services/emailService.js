
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Criar transporter (corrigido: createTransport, não createTransporter)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Template HTML base para emails
  const getEmailTemplate = (title, content, buttonText = null, buttonUrl = null) => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .email-card {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          .brand-name {
            font-size: 28px;
            font-weight: bold;
            color: #ec6d0b;
            margin-bottom: 5px;
          }
          .brand-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
          }
          .content {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #999;
          }
          .footer-links {
            margin: 15px 0;
          }
          .footer-links a {
            color: #ec6d0b;
            text-decoration: none;
            margin: 0 10px;
          }
          .divider {
            height: 3px;
            background: linear-gradient(135deg, #f3ab6b 0%, #ec6d0b 100%);
            margin: 20px 0;
            border-radius: 2px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-card">
            <div class="header">
              <div class="logo">BTV</div>
              <div class="brand-name">Bem Ti Vê</div>
              <div class="brand-subtitle">Sistema de Gestão Culinária</div>
              <div class="divider"></div>
            </div>
            
            <h1 class="title">${title}</h1>
            
            <div class="content">
              ${content}
            </div>
            
            ${buttonText && buttonUrl ? `
              <div style="text-align: center;">
                <a href="${buttonUrl}" class="button">${buttonText}</a>
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Este email foi enviado automaticamente pelo sistema <strong>Bem Ti Vê</strong></p>
              <div class="footer-links">
                <a href="#">Política de Privacidade</a> |
                <a href="#">Termos de Uso</a> |
                <a href="#">Suporte</a>
              </div>
              <p>© ${new Date().getFullYear()} Bem Ti Vê - Sistema de Gestão Culinária</p>
              <p style="font-size: 12px; color: #ccc;">
                Enviado em ${new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Configurar mensagem com template HTML
  const message = {
    from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || getEmailTemplate(
      options.subject,
      options.message.replace(/\n/g, '<br>'),
      options.buttonText,
      options.buttonUrl
    )
  };

  // Enviar email
  const info = await transporter.sendMail(message);

  console.log('📧 Email enviado:', info.messageId);
};

module.exports = sendEmail;
