const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;

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
    await conn.sendMessage(grupo.id, { text: `📢 *AVISO DEL BOT:*\n\n${textoAviso}` });
  } catch (e) {
    return conn.sendMessage(chatId, { text: `❌ Error al enviar mensaje al grupo ${grupo.name}.` }, { quoted: msg });
  }

  return conn.sendMessage(chatId, {
    text: `✅ Aviso enviado correctamente al grupo *${grupo.name}* (número ${numero}).`
  }, { quoted: msg });
};

handler.command = ['aviso'];
module.exports = handler;