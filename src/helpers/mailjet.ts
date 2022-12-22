// import dotenv from "dotenv";
// dotenv.config();

// const mailjet = require("node-mailjet").connect(
//   process.env.MAILJET_1,
//   process.env.MAILJET_2
// );

// export  function mailer(email,firstname,lastname,order_date,order_id) {
//   const request = mailjet.post("send", { version: "v3.1" }).request({
//     Messages: [
//       {
//         From: {
//           Email: "contact@vb-bmx-club.fr",
//           Name: "VB BMX CLUB",
//         },
//         To: [
//           {
//             Email: email,
//             Name: firstname + " " + lastname,
//           },
//         ],
//         TemplateID: 4269222,
//         TemplateLanguage: true,
//         Subject: "Confirmation de votre commande",
//         Variables: {
//           firstname: firstname,
//           order_date: order_date,
//           order_id: order_id,
//         },
//       },
//     ],
//   });
//   return request;
// }

// export  function mailerReset(email,firstname,lastname,urlReset) {
//   const request = mailjet.post("send", { version: "v3.1" }).request({
//     Messages: [
//       {
//         From: {
//           Email: "contact@vb-bmx-club.fr",
//           Name: "VB BMX CLUB",
//         },
//         To: [
//           {
//             Email: email,
//             Name: firstname + " " + lastname,
//           },
//         ],
//         TemplateID: 4282412,
//         TemplateLanguage: true,
//         Subject: "Réinitialisation du mot de passe",
//         Variables: {
//           firstname: firstname,
//           urlReset
//         },
//       },
//     ],
//   });
//   return request;
// }

// export  function mailerCommandStatus(email,firstname,lastname,order_number) {
//   const request = mailjet.post("send", { version: "v3.1" }).request({
//     Messages: [
//       {
//         From: {
//           Email: "contact@vb-bmx-club.fr",
//           Name: "VB BMX CLUB",
//         },
//         To: [
//           {
//             Email: email,
//             Name: firstname + " " + lastname,
//           },
//         ],
//         TemplateID: 4288162,
//         TemplateLanguage: true,
//         Subject: "Votre commande est disponible à la récupération",
//         Variables: {
//           firstname: firstname,
//           order_number: order_number,
//         },
//       },
//     ],
//   });
//   return request;
// }
