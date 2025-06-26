const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();
  const jid = msg.key.participant || msg.key.remoteJid;

  // Obtener nombre del grupo o "Privado"
  let groupName = "Privado";
  if (chatId.endsWith("@g.us")) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      groupName = metadata.subject || "Sin nombre";
    } catch {
      groupName = "Grupo (no disponible)";
    }
  }

  // Número del dueño principal
  const ownerNumber = global.owner[0]?.[0] || "";

  // 🟡 Si no hay mensaje, mostrar ejemplo
  if (!text) {
    return conn.sendMessage(chatId, {
      text: 
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊  📩 *EJEMPLO DE REPORTE*
┊ 
┊  Por favor, describe el error o sugerencia.
┊ 
┊  *Ejemplo:*
┊  .report El comando .menu no responde
┊ 
┊  Entre más detalles des, mejor te ayudaremos.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
    }, { quoted: msg });
  }

  // Mensaje al owner
  const ownerMsg = 
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ 🚨 *NUEVO REPORTE* 🚨
┊ 
┊ 👤 *Usuario:* @${jid}
┊ 📝 *Mensaje:* ${text}
┊ 🏷️ *Grupo:* ${groupName}
┊ 🆔 *ID:* ${chatId}
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`;

  await conn.sendMessage(`${ownerNumber}@s.whatsapp.net`, {
    text: ownerMsg,
    mentions: [jid]
  });

  // Mensaje de confirmación al usuario
  await conn.sendMessage(chatId, {
    text: 
`╭┈┈┈┈┈┈┈┈┈┈┈┈┈≫
┊ ✅ *REPORTE ENVIADO*
┊ 
┊ ¡Gracias por tu reporte!
┊ Tu mensaje ha sido enviado al dueño del bot.
┊ 
┊ 🔍 Tu ayuda mejora el servicio 💖
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`
  }, { quoted: msg });
};

handler.command = ['report'];
module.exports = handler;