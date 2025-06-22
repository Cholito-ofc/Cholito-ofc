const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  // Solo permite al Owner
  if (!global.owner.some(([id]) => id === senderNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo el *owner* del bot puede usar este comando."
    }, { quoted: msg });
  }

  if (!global.gruposAdmin || global.gruposAdmin.length === 0) {
    return conn.sendMessage(chatId, {
      text: '⚠️ No hay lista de grupos disponible. Usa primero el comando *!listargrupos* para ver los números de los grupos donde soy admin.'
    }, { quoted: msg });
  }

  if (!args[0]) {
    return conn.sendMessage(chatId, {
      text: '❌ Debes especificar el número del grupo y el mensaje.\n\n*Uso:* .aviso <número> <mensaje>\nEjemplo: .aviso 2 Este es un aviso.'
    }, { quoted: msg });
  }

  const numero = args[0].trim();
  if (!/^\d+$/.test(numero)) {
    return conn.sendMessage(chatId, {
      text: '❌ Formato de número inválido. Usa *!listargrupos* para ver los números disponibles.'
    }, { quoted: msg });
  }

  const idx = parseInt(numero, 10) - 1;
  if (isNaN(idx) || idx < 0 || idx >= global.gruposAdmin.length) {
    return conn.sendMessage(chatId, {
      text: `❌ No se encontró ningún grupo con el número *${numero}*. Usa *!listargrupos* para ver los números disponibles.`
    }, { quoted: msg });
  }

  const textoAviso = args.slice(1).join(' ');
  if (!textoAviso) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Debes escribir un mensaje para enviar.\n\n*Ejemplo:*\n.aviso 2 Este es un aviso importante.'
    }, { quoted: msg });
  }

  const grupo = global.gruposAdmin[idx];

  try {
    // Obtener participantes del grupo destino
    const meta = await conn.groupMetadata(grupo.id);
    const participantes = meta.participants.map(p => p.id);

    // El formato correcto para mención real
    const senderMention = sender ? `@${sender.split('@')[0]}` : '';

    // Enviar aviso personalizado y mencionando a todos (incluyendo el que manda)
    await conn.sendMessage(grupo.id, {
      text:
        `╭─────•◈•─────╮\n` +
        `      📢 *AVISO DEL BOT* 📢\n` +
        `╰─────•◈•─────╯\n\n` +
        `👤 *Enviado por:* ${senderMention}\n` +
        `🏷️ *Para todos los miembros del grupo*\n\n` +
        `${textoAviso}\n\n` +
        `🔔 _Por favor leer con atención_`,
      mentions: [sender, ...participantes]
    });

    return conn.sendMessage(chatId, {
      text: `✅ *Aviso enviado exitosamente al grupo* _${grupo.name}_ (número ${numero}).\n\n📢 Todos los miembros han sido mencionados.`,
    }, { quoted: msg });

  } catch (e) {
    return conn.sendMessage(chatId, { text: `❌ Error al enviar mensaje al grupo ${grupo.name}.\n\nDetalles: ${e.message || e}` }, { quoted: msg });
  }
};

handler.command = ['aviso'];
module.exports = handler;