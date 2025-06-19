// plugins/reporte.js
const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const reporte = args.join(" ").trim();

  if (!reporte) {
    return conn.sendMessage(chatId, {
      text: "❗ *Escribe el motivo del reporte.*\n\nEjemplo: .reporte El bot no responde correctamente.",
    }, { quoted: msg });
  }

  // Solo al owner principal (primer número en global.owner)
  const ownerNum = global.owner[0][0] + "@s.whatsapp.net";
  const mentionId = senderNum + "@s.whatsapp.net";
  const waMention = `@${senderNum}`;

  const mensajeOwner = 
    `🚨 *Nuevo reporte recibido*\n\n` +
    `👤 *Usuario:* ${waMention}\n` + // Esto mostrará @521XXXXXXXXXX y será clickeable
    `💬 *Mensaje:* ${reporte}\n` +
    `🌐 *Chat:* ${chatId}\n`;

  await conn.sendMessage(ownerNum, { 
    text: mensajeOwner,
    mentions: [mentionId]
  });

  return conn.sendMessage(chatId, {
    text: "✅ *Tu reporte ha sido enviado al owner principal!*\nGracias por ayudar a mejorar el bot.",
    quoted: msg
  });
};

handler.command = ["reporte"];
handler.tags = ["tools"];
handler.help = ["reporte <texto>"];
module.exports = handler;