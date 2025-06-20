const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;

  if (!global.gruposAdmin || global.gruposAdmin.length === 0) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Debes usar primero el comando *!listargrupos* para obtener la lista de grupos donde soy admin.'
    }, { quoted: msg });
  }

  const numeroGrupo = parseInt(args[0]);
  const texto = args.slice(1).join(' ');

  if (isNaN(numeroGrupo) || numeroGrupo < 1 || numeroGrupo > global.gruposAdmin.length) {
    return conn.sendMessage(chatId, {
      text: '❌ Número de grupo inválido. Usa *!listargrupos* para ver los grupos disponibles.'
    }, { quoted: msg });
  }

  if (!texto) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Debes escribir un mensaje para enviar.\n\n*Ejemplo:*\n!avisogrupo 1 Este es un aviso importante.'
    }, { quoted: msg });
  }

  const grupo = global.gruposAdmin[numeroGrupo - 1];
  await conn.sendMessage(grupo.id, { text: `📢 *AVISO DEL BOT:*\n\n${texto}` });

  return conn.sendMessage(chatId, {
    text: `✅ Aviso enviado correctamente al grupo *${grupo.name}*.`
  }, { quoted: msg });
};

handler.command = ['aviso'];
module.exports = handler;