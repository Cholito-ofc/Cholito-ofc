const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  global.gruposAdmin = [];

  // Obtener todos los grupos donde el bot participa
  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Ocurrió un error al obtener la lista de TODOS los grupos.' }, { quoted: msg });
  }

  let listaTexto = '📋 *Lista de TODOS los grupos donde estoy:*\n\n';
  let index = 1;
  let todosIds = '';
  let adminIds = '';
  const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  for (const id in groupMetadatas) {
    const metadata = groupMetadatas[id];
    const botParticipant = metadata.participants.find(p => p.id === botId);
    const esAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
    if (esAdmin) global.gruposAdmin.push({ id, name: metadata.subject });

    listaTexto += `*${index}*. ${metadata.subject}\n🆔 ${id}\n${esAdmin ? '⭐️ Soy admin aquí ⭐️' : '─ No soy admin aquí'}\n\n`;
    todosIds += `${id} `;
    if (esAdmin) adminIds += `${id} `;
    index++;
  }

  if (index === 1) {
    return conn.sendMessage(chatId, { text: '❌ No estoy en ningún grupo.' }, { quoted: msg });
  }

  listaTexto += '━━━━━━━━━━━━━━━━━━━━\n';
  listaTexto += '*🆔 Todos los IDs de los grupos:*\n';
  listaTexto += todosIds.trim() + '\n\n';
  listaTexto += adminIds
    ? '*⭐️ IDs donde soy admin:*\n' + adminIds.trim()
    : '*No soy admin en ningún grupo.*';

  return conn.sendMessage(chatId, { text: listaTexto }, { quoted: msg });
};

handler.command = ['listgrupos', 'vergrupos', 'todosgrupos'];
module.exports = handler;