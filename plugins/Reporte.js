const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();
  // Usar participant si existe, si no usar remoteJid
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumRaw = sender.replace(/[^0-9]/g, "");
  
  // Formato +504 8911-5621 (ajusta si tu país usa diferente formato)
  let senderNum = senderNumRaw;
  if (senderNum.length === 8) { // Ejemplo Honduras 8 dígitos
    senderNum = "+504 " + senderNum.slice(0, 4) + "-" + senderNum.slice(4);
  } else if (senderNum.length > 8) { // Si tienes otros formatos, ajusta aquí
    senderNum = "+" + senderNumRaw;
  }

  // Cambia esto según como tengas tu global.owner
  const ownerNumber = global.owner[0]?.[0] || ""; // Primer dueño de la lista

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "✳️ Usa el comando así:\n\n*.report [Describe el error o fallo]*\nEjemplo:\n*.report El bot no responde a .menu*"
    }, { quoted: msg });
  }

  // Mensaje que recibe el dueño
  const ownerMsg = `🚨 *Nuevo Reporte*\n\n👤 *Usuario:* ${senderNum}\n📝 *Mensaje:* ${text}\n\n🌐 *Chat:* ${chatId}`;
  await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { text: ownerMsg });

  // Respuesta al usuario
  await conn.sendMessage(chatId, {
    text: "✅ Tu reporte ha sido enviado al dueño del bot. ¡Gracias por ayudar a mejorar el servicio!"
  }, { quoted: msg });
};

handler.command = ['report'];
module.exports = handler;