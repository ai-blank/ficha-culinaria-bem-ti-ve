
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

  // Configurar mensagem
  const message = {
    from: `${process.env.EMAIL_FROM} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`
  };

  // Enviar email
  const info = await transporter.sendMail(message);

  console.log('📧 Email enviado:', info.messageId);
};

module.exports = sendEmail;
