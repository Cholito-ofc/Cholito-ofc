const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const reporte = args.join(" ").trim();

  if (!reporte) {
    return conn.sendMessage(chatId, {
      text: "❗ *Escribe el motivo del reporte.*\n\nEjemplo: .reporte El bot no responde correctamente.",
    }, { quoted: msg });
  }

  // OBTENER EL NÚMERO DEL PARTICIPANTE Y LIMPIAR EL SUFIJO @lid
  let senderId = "";
  if (msg.key && msg.key.participant) {
    senderId = msg.key.participant;
  } else if (msg.participant) {
    senderId = msg.participant;
  } else if (msg.key && msg.key.remoteJid && !msg.key.remoteJid.endsWith('@g.us')) {
    senderId = msg.key.remoteJid;
  }

  // Quita todo lo que está después del @ (incluido el @)
  let senderNum = "";
  if (senderId && senderId.includes('@')) {
    senderNum = senderId.split('@')[0];
  } else {
    senderNum = senderId.replace(/[^0-9]/g, "");
  }

  if (!senderNum || senderNum.length < 8) senderNum = "NO_DETECTADO";

  const ownerNum = global.owner[0][0] + "@s.whatsapp.net";
  const waLink = senderNum !== "NO_DETECTADO" ? `https://wa.me/${senderNum}` : "Número no detectado";
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