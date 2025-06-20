const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();

  // Obtener el número del usuario en formato internacional y con guion
  const sender = msg.key.participant || msg.key.remoteJid;
  let senderNumRaw = sender.replace(/[^0-9]/g, "");
  // Si ya incluye el código de país (ej: 504 para Honduras)
  if (senderNumRaw.length === 12) { // ejemplo: 50489115621
    senderNumRaw = '+' + senderNumRaw;
  } else if (senderNumRaw.length === 8) { // sólo número local
    senderNumRaw = '+504' + senderNumRaw; // ajusta el código de país aquí si es necesario
  }
  // Separar y poner guion: +504 8911-5621
  let senderNum = senderNumRaw.replace(/(\+\d{3})(\d{4})(\d{4})/, '$1 $2-$3');

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

  // Número del dueño principal (ajustar si tu global.owner es diferente)
  const ownerNumber = global.owner[0]?.[0] || "";

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "✳️ Usa el comando así:\n\n*.report [Describe el error o fallo]*\nEjemplo:\n*.report El bot no responde a .menu*"
    }, { quoted: msg });
  }

  // Mensaje al owner
  const ownerMsg = `🚨 *Nuevo Reporte*\n\n👤 *Usuario:* ${senderNum}\n🏷️ *Grupo:* ${groupName}\n📝 *Mensaje:* ${text}\n\n🌐 *Chat:* ${chatId}`;
  await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { text: ownerMsg });

  // Respuesta al usuario
  await conn.sendMessage(chatId, {
    text: "✅ Tu reporte ha sido enviado al dueño del bot. ¡Gracias por ayudar a mejorar el servicio!"
  }, { quoted: msg });
};

handler.command = ['report'];
module.exports = handler;