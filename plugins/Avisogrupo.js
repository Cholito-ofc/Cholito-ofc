const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;

  if (!global.gruposAdmin || global.gruposAdmin.length === 0) {
    return conn.sendMessage(chatId, {
      text: '⚠️ No hay lista de grupos disponible. Usa primero el comando *!listargrupos* para obtener los códigos de los grupos donde soy admin.'
    }, { quoted: msg });
  }

  if (!args[0]) {
    return conn.sendMessage(chatId, {
      text: '❌ Debes especificar el código de 3 dígitos y el mensaje.\n\n*Uso:* .aviso <código> <mensaje>\nEjemplo: .aviso 123 Este es un aviso.'
    }, { quoted: msg });
  }

  const codigo = args[0].trim();
  if (!/^\d{3}$/.test(codigo)) {
    return conn.sendMessage(chatId, {
      text: '❌ Formato de código inválido. Debe ser un número de 3 dígitos. Usa *!listargrupos* para ver los códigos.'
    }, { quoted: msg });
  }

  const textoAviso = args.slice(1).join(' ');
  if (!textoAviso) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Debes escribir un mensaje para enviar.\n\n*Ejemplo:*\n.aviso 123 Este es un aviso importante.'
    }, { quoted: msg });
  }

  const grupo = global.gruposAdmin.find(g => g.code === codigo);
  if (!grupo) {
    return conn.sendMessage(chatId, {
      text: `❌ No se encontró ningún grupo con el código *${codigo}*. Usa *!listargrupos* para ver los códigos disponibles.`
    }, { quoted: msg });
  }

  try {
    await conn.sendMessage(grupo.id, { text: `📢 *AVISO DEL BOT:*\n\n${textoAviso}` });
  } catch (e) {
    return conn.sendMessage(chatId, { text: `❌ Error al enviar mensaje al grupo ${grupo.name}.` }, { quoted: msg });
  }

  return conn.sendMessage(chatId, {
    text: `✅ Aviso enviado correctamente al grupo *${grupo.name}* (código ${grupo.code}).`
  }, { quoted: msg });
};

handler.command = ['aviso'];
module.exports = handler;