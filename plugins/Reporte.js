// plugins/reporte.js
const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const reporte = args.join(" ").trim();

  if (!reporte) {
    return conn.sendMessage(chatId, {
      text: "❗ *Escribe el motivo del reporte.*\n\nEjemplo: .reporte El bot no responde correctamente.",
    }, { quoted: msg });
  }

  // --- DETECCIÓN UNIVERSAL DEL NÚMERO REAL ---
  let senderId = "";
  // 1. Si viene de grupo y existe msg.key.participant
  if (msg.key && msg.key.participant) {
    senderId = msg.key.participant;
  }
  // 2. Si existe msg.participant (algunas versiones)
  else if (msg.participant) {
    senderId = msg.participant;
  }
  // 3. Si no, usar remoteJid (mensajes privados)
  else if (msg.key && msg.key.remoteJid) {
    senderId = msg.key.remoteJid;
  }
  // 4. Extra: Algunos eventos envían msg.message?.senderKeyDistributionMessage?.groupId
  else if (
    msg.message &&
    msg.message.senderKeyDistributionMessage &&
    msg.message.senderKeyDistributionMessage.groupId
  ) {
    senderId = msg.message.senderKeyDistributionMessage.groupId;
  }

  // Limpiar el número (quitar todo lo que no sea dígito)
  let senderNum = senderId.replace(/[^0-9]/g, "");

  // --- DEBUG EXTRA: Si el número sigue sin estar bien, fuerza el split en @ ---
  if (senderNum.length < 8 && senderId.includes('@')) {
    senderNum = senderId.split('@')[0];
  }

  // Si el número sigue raro, avísale al owner para debug
  if (senderNum.length < 8) senderNum = "NO_DETECTADO";

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