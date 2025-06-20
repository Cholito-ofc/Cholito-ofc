const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  global.gruposAdmin = [];

  // Obtener todos los grupos donde el bot participa
  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Ocurrió un error al obtener la lista de grupos.' }, { quoted: msg });
  }

  let listaTexto = '📋 *Grupos donde soy administrador:*\n\n';
  let index = 1;
  let todosIds = '';
  const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  for (const id in groupMetadatas) {
    const metadata = groupMetadatas[id];
    const botParticipant = metadata.participants.find(p => p.id === botId);

    if (botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')) {
      global.gruposAdmin.push({ id, name: metadata.subject });
      listaTexto += `*${index}*. ${metadata.subject}\n🆔 ${id}\n\n`;
      todosIds += `${id} `;
      index++;
    }
  }

  if (global.gruposAdmin.length === 0) {
    return conn.sendMessage(chatId, { text: '❌ No soy administrador en ningún grupo.' }, { quoted: msg });
  }

  listaTexto += '━━━━━━━━━━━━━━━━━━━━\n';
  listaTexto += '*🆔 Todos los IDs de los grupos:*\n';
  listaTexto += todosIds.trim();

  return conn.sendMessage(chatId, { text: listaTexto }, { quoted: msg });
};

handler.command = ['listgrupos', 'vergrupos'];
module.exports = handler;