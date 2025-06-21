const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();
  const jid = msg.key.participant || msg.key.remoteJid;

  // Solo el número limpio para mención
  const userNumber = jid.replace(/[^0-9]/g, "");

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

  // Número del dueño principal (ajusta si tu owner es distinto)
  const ownerNumber = global.owner[0]?.[0] || "";

  // Si no hay texto, mostrar ejemplo de uso bonito
  if (!text) {
    return conn.sendMessage(chatId, {
      text:
`╭━[ 📝  *EJEMPLO DE REPORTE*  ]━╮

Por favor, describe el error o sugerencia.

*Ejemplo:*
.report El bot no responde a .menu

¡Entre más detalles brindes, mejor podremos ayudarte!

╰━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
  }

  // Mensaje bonito al owner, solo mención del usuario con @numero
  const ownerMsg = 
`╭━[ 🚨  *NUEVO REPORTE*  🚨 ]━╮

👤 *Usuario:*
   @${userNumber}

📝 *Mensaje:*
   ${text}

🏷️ *Grupo:*
   ${groupName}

🆔 *ID del grupo:*
   ${chatId}

╰━━━━━━━━━━━━━━━━━━━━━╯`;

  await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { 
    text: ownerMsg,
    mentions: [userNumber + "@s.whatsapp.net"]
  });

  // Confirmación al usuario con diseño bonito
  await conn.sendMessage(chatId, {
    text:
`╭━[ ✅ *REPORTE ENVIADO* ]━╮

¡Gracias por tu reporte!
Tu mensaje ha sido enviado con éxito al dueño del bot.

🔎 Tu ayuda es importante para mejorar el servicio.

╰━━━━━━━━━━━━━━━━━━━━━╯`
  }, { quoted: msg });
};

handler.command = ['report'];
module.exports = handler;