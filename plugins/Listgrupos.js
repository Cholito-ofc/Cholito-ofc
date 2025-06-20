const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // Reiniciamos la lista global
  global.gruposAdmin = [];

  let texto = '📋 *Grupos donde soy administrador:*\n\n';
  let index = 1;

  // Obtener todos los IDs de grupos activos
  const groupJids = Object.keys(conn.chats).filter(jid => jid.endsWith('@g.us'));

  for (const jid of groupJids) {
    try {
      const metadata = await conn.groupMetadata(jid);

      // Verificar si el bot es administrador
      const isAdmin = metadata.participants.some(p => p.id === botNumber && p.admin);
      if (isAdmin) {
        global.gruposAdmin.push({ id: jid, name: metadata.subject });
        texto += `*${index}*. ${metadata.subject}\n`;
        index++;
      }
    } catch (e) {
      // Si el bot no puede acceder al grupo (por ejemplo, fue eliminado), lo ignoramos
      continue;
    }
  }

  if (global.gruposAdmin.length === 0) {
    return conn.sendMessage(chatId, {
      text: '❌ No soy administrador en ningún grupo.'
    }, { quoted: msg });
  }

  return conn.sendMessage(chatId, {
    text: texto
  }, { quoted: msg });
};

handler.command = ['listgrupos'];
module.exports = handler;