const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Preencha nome, e-mail e mensagem para continuar.",
    });
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !toEmail) {
    return res.status(500).json({
      success: false,
      message: "O servidor de e-mail ainda não está configurado. Configure SMTP no backend.",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `${name} <${smtpUser}>`,
      to: toEmail,
      replyTo: email,
      subject: subject ? `[DVS Web] ${subject}` : "[DVS Web] Nova mensagem de contato",
      text: `Nome: ${name}\nE-mail: ${email}\nAssunto: ${subject || "Sem assunto"}\n\nMensagem:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h3>Nova mensagem do site</h3>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${subject || "Sem assunto"}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${message.replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    return res.json({ success: true, message: "Mensagem enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return res.status(500).json({
      success: false,
      message: "Não foi possível enviar a mensagem no momento.",
    });
  }
});

module.exports = router;
