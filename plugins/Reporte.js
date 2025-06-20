const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();

  // Obtener el número del usuario correctamente
  const sender = msg.key.participant || msg.key.remoteJid;
  let senderNumRaw = sender.replace(/[^0-9]/g, "");
  // Si el número es local, añade el código de país (ajusta si tu código de país es otro)
  if (senderNumRaw.length === 8) senderNumRaw = '504' + senderNumRaw;
  // Para el enlace clickeable
  const waLink = `https://wa.me/${senderNumRaw}`;
  // Para el texto visible con espacio y guion
  const senderNumDisplay = senderNumRaw.replace(/(\d{3})(\d{4})(\d{4})/, '+$1 $2-$3');

  // Nombre del grupo o "Privado"
  let groupName = "Privado";
  if (chatId.endsWith("@g.us")) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      groupName = metadata.subject || "Sin nombre";
    } catch (e) {
      groupName = "Grupo (no se pudo obtener el nombre)";
    }
  }

  // Número del dueño principal (ajusta si es necesario)
  const ownerNumber = global.owner[0]?.[0] || "";

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "✳️ Usa el comando así:\n\n*.report [Describe el error o fallo]*\nEjemplo:\n*.report El bot no responde a .menu*"
    }, { quoted: msg });
  }

  // Mensaje al owner, con número clickeable y formato bonito
  const ownerMsg = `🚨 *Nuevo Reporte*\n\n👤 *Usuario:* ${senderNumDisplay}\n🔗 *Chat:* ${waLink}\n🏷️ *Grupo:* ${groupName}\n📝 *Mensaje:* ${text}\n\n🌐 *ChatID:* ${chatId}`;
  await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { text: ownerMsg });

  // Confirmación al usuario
  await conn.sendMessage(chatId, {
    text: "✅ Tu reporte ha sido enviado al dueño del bot. ¡Gracias por ayudar a mejorar el servicio!"
  }, { quoted: msg });
};

handler.command = ['report'];
module.exports = handler;