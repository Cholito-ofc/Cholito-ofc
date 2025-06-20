const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  global.gruposAdmin = []; // reinicia lista

  const allChats = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us'));

  let index = 1;
  let texto = '📋 *Grupos donde soy administrador:*\n\n';

  for (const [id] of allChats) {
    try {
      const metadata = await conn.groupMetadata(id);
      const isAdmin = metadata.participants.some(p => p.id === botNumber && p.admin);
      if (isAdmin) {
        global.gruposAdmin.push({ id, name: metadata.subject });
        texto += `*${index}*. ${metadata.subject}\n`;
        index++;
      }
    } catch (e) {
      // si el bot fue eliminado del grupo, ignora
      continue;
    }
  }

  if (global.gruposAdmin.length === 0) {
    return conn.sendMessage(chatId, {
      text: '❌ No soy administrador en ningún grupo.'
    }, { quoted: msg });
  }

  return conn.sendMessage(chatId, { text: texto }, { quoted: msg });
};

handler.command = ['listargrupos'];
module.exports = handler;