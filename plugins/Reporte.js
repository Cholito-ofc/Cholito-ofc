const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();
  const jid = msg.key.participant || msg.key.remoteJid;

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

  const ownerNumber = global.owner[0]?.[0] || "";

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "✳️ Usa el comando así:\n\n*.report [Describe el error o fallo]*\nEjemplo:\n*.report El bot no responde a .menu*"
    }, { quoted: msg });
  }

  const ownerMsg = 
`╭━━━[ 🚨  NUEVO REPORTE  🚨 ]━━━╮

👤 *Usuario:*
   @${jid}

📝 *Mensaje:*
   ${text}

🏷️ *Grupo:*
   ${groupName}

🆔 *ID del grupo:*
   ${chatId}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { 
    text: ownerMsg,
    mentions: [jid]
  });

  await conn.sendMessage(chatId, {
    text: "✅ Tu reporte ha sido enviado al dueño del bot. ¡Gracias por ayudar a mejorar el servicio!"
  }, { quoted: msg });
};

handler.command = ['report'];
module.exports = handler;