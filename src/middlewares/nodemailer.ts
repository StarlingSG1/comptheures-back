"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
export async function mailer(mailto: string, title: string, url: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // Créez un nouvel objet de transporteur
  const transporter = nodemailer.createTransport({
    host: "smtp.ionos.fr",
    port: 465,
    secure: true, // utilise SSL
    auth: {
      user: "contact@comptheures.fr",
      pass: "4GaqXn@9@8sad@T4",
    },
  });

  // Définissez les options de l'e-mail
  const mailOptions = {
    from: `"Comptheures " <${"contact@comptheures.fr"}>`,
    to: `${mailto}`,
    subject: `${title}`,
    html: `<div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
    <div style="background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 5px; box-shadow: 0 2px 2px rgba(0, 0, 0, 0.05); max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px;">${title}</h2>
        <p style="color: #666666; font-size: 16px;">Vous avez demandé à réinitialiser votre mot de passe, cliquez sur le lien pour poursuivre : <a href=${url} style="text-decoration: underline; font-weight: 500">${url}</a></p>
        <p style="color: #666666; font-size: 16px;">Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter à l'email suivant : <span style="text-decoration: underline">contact@comptheures.fr</span></p>
    </div>
</div>`,
  };

  // Envoyez l'e-mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } 
      console.log(`Email envoyé : à ${mailto} | ` + info.response);
  });
}
