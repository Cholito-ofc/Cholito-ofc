const fs = require("fs");
const fetch = require("node-fetch");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  // 🚫 Si no es owner
  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: `🚫 *Acceso denegado:*\nEste comando es exclusivo para el *propietario del bot*.`,
      mentions: [sender]
    }, { quoted: msg });
  }

  // ✅ Guardar apagado en el archivo
  const filePath = "./activos.json";
  const data = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
    : {};

  if (!data.apagado) data.apagado = {};
  data.apagado[chatId] = true;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  // 🎉 Mensaje personalizado
  const mensaje = `
\`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」\`

*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈* 𝖠𝗉𝖺𝗀𝖺𝗋
*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈 :* 𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈
*│┊➺ 𝖯𝖺𝗋𝖺:* 𝖤𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈
*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* 𝖭𝗈 𝗋𝖾𝗌𝗉𝗈𝗇𝖽𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈𝗌 𝖾𝗑𝖾𝖼𝗍𝗈 𝖾𝗅 𝗈𝗐𝗇𝖾𝗋
*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*`;

  // vCard decorativo
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "𝙈𝙤𝙙𝙤 𝘼𝙥𝙖𝙜𝙖𝙙𝙤",
        jpegThumbnail: await (await fetch('https://iili.io/F0WZNEX.th.png')).buffer(),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Unlimited;;;\n" +
          "FN:Unlimited\n" +
          "ORG:Unlimited\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Unlimited\n" +
          "X-WA-BIZ-DESCRIPTION:ofc\n" +
          "X-WA-BIZ-NAME:Unlimited\n" +
          "END:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  };

  // Enviar mensaje con vCard decorativo
  await conn.sendMessage(chatId, {
    text: mensaje.trim(),
    mentions: [sender]
  }, { quoted: fkontak });
};

handler.command = ["apagar"];
module.exports = handler;