const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const reporte = args.join(" ").trim();

  if (!reporte) {
    return conn.sendMessage(chatId, {
      text: "❗ *Escribe el motivo del reporte.*\n\nEjemplo: .reporte El bot no responde correctamente.",
    }, { quoted: msg });
  }

  let senderId = "";
  let tipo = "";
  // Si viene de grupo
  if (msg.key && msg.key.participant) {
    senderId = msg.key.participant;
    tipo = senderId.endsWith("@lid") ? "lid" : "jid";
  } else if (msg.participant) {
    senderId = msg.participant;
    tipo = senderId.endsWith("@lid") ? "lid" : "jid";
  } else if (msg.key && msg.key.remoteJid && !msg.key.remoteJid.endsWith('@g.us')) {
    senderId = msg.key.remoteJid;
    tipo = senderId.endsWith("@s.whatsapp.net") ? "jid" : "lid";
  }

  let senderNum = senderId.includes('@') ? senderId.split('@')[0] : senderId.replace(/[^0-9]/g, "");
  let waLink = "No disponible por privacidad de WhatsApp";

  // Si es JID normal, puedes generar enlace
  if (tipo === "jid") {
    waLink = `https://wa.me/${senderNum}`;
  }

  const userName = msg.pushName || senderNum;

  let aviso = tipo === "lid"
    ? "\n*Nota:* Debido a la privacidad de WhatsApp, el número real no está disponible cuando el usuario no está en tus contactos o tiene ciertas configuraciones. Solo el owner puede pedirle al usuario que mande mensaje por privado para obtener el número real."
    : "";

  const mensajeOwner =
    `🚨 *Nuevo reporte recibido*\n\n` +
    `👤 *Usuario:* ${userName}\n` +
    `📱 *Identificador:* ${senderNum} @${tipo}\n` +
    `🔗 *Chat directo:* ${waLink}\n` +
    `💬 *Mensaje:* ${reporte}\n` +
    `🌐 *Chat ID:* ${chatId}\n` +
    aviso;

  await conn.sendMessage(global.owner[0][0] + "@s.whatsapp.net", { text: mensajeOwner });

  return conn.sendMessage(chatId, {
    text: "✅ *Tu reporte ha sido enviado al owner principal!*\nGracias por ayudar a mejorar el bot.",
    quoted: msg
  });
};

handler.command = ["reporte"];
handler.tags = ["tools"];
handler.help = ["reporte <texto>"];
module.exports = handler;