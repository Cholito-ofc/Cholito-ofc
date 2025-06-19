// plugins/reporte.js
const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  let senderId = "";

  // 1. Grupos: msg.participant o msg.key.participant
  if (msg.participant) {
    senderId = msg.participant;
  } else if (msg.key.participant) {
    senderId = msg.key.participant;
  }
  // 2. Privados: msg.key.remoteJid
  if (!senderId) {
    senderId = msg.key.remoteJid;
  }
  // 3. Extra: En algunos casos puede venir con ":"
  if (senderId.includes(":")) {
    senderId = senderId.split(":")[0];
  }

  // Extraer solo el número
  const senderNum = senderId.replace(/[^0-9]/g, "");

  const reporte = args.join(" ").trim();

  if (!reporte) {
    return conn.sendMessage(chatId, {
      text: "❗ *Escribe el motivo del reporte.*\n\nEjemplo: .reporte El bot no responde correctamente.",
    }, { quoted: msg });
  }

  // Solo al owner principal (primer número en global.owner)
  const ownerNum = global.owner[0][0] + "@s.whatsapp.net";
  const waLink = `https://wa.me/${senderNum}`;
  const userName = msg.pushName || senderNum;

  const mensajeOwner =
    `🚨 *Nuevo reporte recibido*\n\n` +
    `👤 *Usuario:* ${userName}\n` +
    `📱 *Número:* ${senderNum}\n` +
    `🔗 *Chat directo:* ${waLink}\n` +
    `💬 *Mensaje:* ${reporte}\n` +
    `🌐 *Chat ID:* ${chatId}\n`;

  await conn.sendMessage(ownerNum, { text: mensajeOwner });

  return conn.sendMessage(chatId, {
    text: "✅ *Tu reporte ha sido enviado al owner principal!*\nGracias por ayudar a mejorar el bot.",
    quoted: msg
  });
};

handler.command = ["reporte"];
handler.tags = ["tools"];
handler.help = ["reporte <texto>"];
module.exports = handler;