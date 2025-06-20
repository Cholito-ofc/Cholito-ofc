const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const reportMsg = args.join(" ").trim();

  if (!reportMsg) {
    return conn.sendMessage(chatId, {
      text: "❌ *Indica el mensaje de error o reporte, ejemplo:*\n.reportar El bot no responde los comandos.",
      quoted: msg
    });
  }

  // Obtener nombre del usuario si está disponible
  let senderName = msg.pushName || "Sin nombre";
  // Obtener nombre del grupo si es grupo
  let groupName = "";
  if (isGroup) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      groupName = metadata.subject || "";
    } catch (e) {}
  }

  // Notificar a cada owner
  for (const [ownerNum] of global.owner) {
    const ownerJid = ownerNum.includes("@s.whatsapp.net") ? ownerNum : ownerNum + "@s.whatsapp.net";
    let text = `*🚨 NUEVO REPORTE AL BOT 🚨*\n\n`;
    text += `*De:* wa.me/${senderNum} (${senderName})\n`;
    if (isGroup) {
      text += `*Grupo:* ${groupName}\n`;
      text += `*ID Grupo:* ${chatId}\n`;
    } else {
      text += `*Chat privado*\n`;
    }
    text += `\n*Mensaje:* ${reportMsg}\n`;
    await conn.sendMessage(ownerJid, { text });
  }

  await conn.sendMessage(chatId, {
    text: "✅ *¡Reporte enviado al owner!*\nGracias por ayudar a mejorar el bot.",
    quoted: msg
  });
};

handler.command = ["reportar"];
handler.tags = ["info"];
handler.help = ["reportar <mensaje>"];
module.exports = handler;