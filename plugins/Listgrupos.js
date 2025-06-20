const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  global.gruposAdmin = []; // reinicia la lista en cada uso

  const groupMetadataList = await conn.groupFetchAllParticipating();

  let listaTexto = '📋 *Grupos donde soy administrador:*\n\n';
  let index = 1;

  for (const id in groupMetadataList) {
    const metadata = groupMetadataList[id];
    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';
    const botIsAdmin = metadata.participants.some(p => p.id === botId && p.admin);

    if (botIsAdmin) {
      global.gruposAdmin.push({ id, name: metadata.subject });
      listaTexto += `*${index}*. ${metadata.subject}\n`;
      index++;
    }
  }

  if (global.gruposAdmin.length === 0) {
    return conn.sendMessage(chatId, { text: '❌ No soy administrador en ningún grupo.' }, { quoted: msg });
  }

  return conn.sendMessage(chatId, { text: listaTexto }, { quoted: msg });
};

handler.command = ['listgrupos'];
module.exports = handler;