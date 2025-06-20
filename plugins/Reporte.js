const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();

  // Obtener el JID del usuario que reporta
  const jid = msg.key.participant || msg.key.remoteJid;

  // Formato internacional del número (todo pegado, con +)
  let senderNumRaw = jid.replace(/[^0-9]/g, "");
  if (senderNumRaw.length === 8) senderNumRaw = '504' + senderNumRaw; // Ajusta tu código de país si no es 504
  const senderNum = `+${senderNumRaw}`;
  const waLink = `https://wa.me/${senderNumRaw}`;

  // Obtener nombre del grupo o "Privado"
  let groupName = "Privado";
  if (chatId.endsWith("@g.us")) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      groupName = metadata.subject || "Sin nombre";
    } catch (e) {
      groupName = "Grupo (no se pudo obtener el nombre)";
    }
  }

  // Número del dueño principal
  const ownerNumber = global.owner[0]?.[0] || "";

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "✳️ Usa el comando así:\n\n*.report [Describe el error o fallo]*\nEjemplo:\n*.report El bot no responde a .menu*"
    }, { quoted: msg });
  }

  // Mensaje al owner con la mención como @${jid} y el número correcto
  const ownerMsg = `🚨 *Nuevo Reporte*\n\n👤 *Usuario:* ${senderNum}\n🗣️ *Mención:* @${jid}\n🔗 *Chat:* ${waLink}\n🏷️ *Grupo:* ${groupName}\n📝 *Mensaje:* ${text}\n\n🌐 *ChatID:* ${chatId}`;
  await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { 
    text: ownerMsg,
    mentions: [jid] // Así el mensaje es una mención real y azul/clickeable
  });

  // Confirmación al usuario
  await conn.sendMessage(chatId, {
    text: "✅ Tu reporte ha sido enviado al dueño del bot. ¡Gracias por ayudar a mejorar el servicio!"
  }, { quoted: msg });
};

handler.command = ['report'];
module.exports = handler;