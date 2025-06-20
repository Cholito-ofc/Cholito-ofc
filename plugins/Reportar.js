const handler = async (msg, { conn, args }) => {
  console.log("Comando reportar recibido"); // Para debug
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const reportMsg = args.join(" ").trim();

  if (!reportMsg) {
    await conn.sendMessage(chatId, {
      text: "❌ *Indica el mensaje de error o reporte, ejemplo:*\n.reportar El bot no responde los comandos.",
      quoted: msg
    });
    return;
  }

  // Obtener el número real del usuario (formato correcto)
  let senderId = msg.key.participant || msg.key.remoteJid;
  let senderNum = "";
  if (typeof senderId === "string") {
    senderNum = senderId.split("@")[0].replace(/\D/g, "");
  }

  let senderName = msg.pushName || "Sin nombre";
  let groupName = "";
  if (isGroup) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      groupName = metadata.subject || "";
    } catch (e) {}
  }

  // Fecha y hora
  const now = new Date();
  const fechaHora = now.toLocaleString("es-MX", { timeZone: "America/Mexico_City" });

  // Notificar a cada owner
  for (const [ownerNum] of global.owner) {
    const ownerJid = ownerNum.includes("@s.whatsapp.net") ? ownerNum : ownerNum + "@s.whatsapp.net";
    let text = `*🚨 NUEVO REPORTE AL BOT 🚨*\n\n`;
    text += `*Fecha y hora:* ${fechaHora}\n\n`;
    text += `*De:* wa.me/${senderNum}\n`;
    text += `\n*Nombre:* ${senderName}\n`;
    if (isGroup) {
      text += `\n*Grupo:* ${groupName}\n`;
      text += `*ID Grupo:* ${chatId}\n`;
    } else {
      text += `\n*Chat privado*\n`;
    }
    text += `\n*Mensaje del reporte:*\n${reportMsg}\n`;
    await conn.sendMessage(ownerJid, { text });
  }

  // Responde al usuario confirmando el envío
  await conn.sendMessage(chatId, {
    text: "✅ *¡Reporte enviado al owner!*\nGracias por tu ayuda. El owner revisará tu reporte lo antes posible.",
    quoted: msg
  });
};

handler.command = ["reportar"];
handler.tags = ["info"];
handler.help = ["reportar <mensaje>"];
module.exports = handler;