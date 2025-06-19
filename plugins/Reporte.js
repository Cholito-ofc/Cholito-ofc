const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const reporte = args.join(" ").trim();

  if (!reporte) {
    return conn.sendMessage(chatId, {
      text: "❗ *Escribe el motivo del reporte.*\n\nEjemplo: .reporte El bot no responde correctamente.",
    }, { quoted: msg });
  }

  // Detectar el identificador del usuario
  let senderId = "";
  if (msg.key && msg.key.participant) {
    senderId = msg.key.participant;
  } else if (msg.participant) {
    senderId = msg.participant;
  } else if (msg.key && msg.key.remoteJid && !msg.key.remoteJid.endsWith('@g.us')) {
    senderId = msg.key.remoteJid;
  }

  let senderNum = "";
  let waLink = "";
  let avisoPrivacidad = "";

  if (senderId && senderId.endsWith("@s.whatsapp.net")) {
    senderNum = senderId.split('@')[0];
    waLink = `https://wa.me/${senderNum}`;
  } else if (senderId && senderId.endsWith("@lid")) {
    senderNum = "Privado por WhatsApp";
    waLink = "No disponible por privacidad";
    avisoPrivacidad = "⚠️ *Por la privacidad de WhatsApp, el número real del usuario no está disponible en grupos. Pídale al usuario que le escriba al bot por privado para poder contactarlo.*\n";
  } else {
    senderNum = "No detectado";
    waLink = "No disponible";
  }

  const userName = msg.pushName || senderNum;
  const ownerNum = global.owner[0][0] + "@s.whatsapp.net";

  const mensajeOwner =
    `🚨 *Nuevo reporte recibido*\n\n` +
    `👤 *Usuario:* ${userName}\n` +
    `📱 *Número:* ${senderNum}\n` +
    `🔗 *Chat directo:* ${waLink}\n` +
    `💬 *Mensaje:* ${reporte}\n` +
    `🌐 *Chat ID:* ${chatId}\n\n` +
    avisoPrivacidad;

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