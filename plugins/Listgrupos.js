const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  global.gruposAdmin = [];

  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Ocurrió un error al obtener la lista de grupos.' }, { quoted: msg });
  }

  let listaTexto = '📋 *Lista de TODOS los grupos donde estoy:*\n\n';
  let index = 1;
  const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  for (const id in groupMetadatas) {
    const metadata = groupMetadatas[id];
    // La lista de administradores puede estar en metadata['participants'] o metadata['participants'].filter(p => p.admin)
    // Buscamos los admin reales:
    const admins = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin === true || p.isSuperAdmin === true || p.admin === true)
      .map(p => p.id);

    const esAdmin = admins.includes(botId);

    if (esAdmin) global.gruposAdmin.push({ id, name: metadata.subject });

    listaTexto += `*${index}*. ${metadata.subject}\n🆔 ${id}\n${esAdmin ? '⭐️ Soy admin aquí ⭐️' : '─ No soy admin aquí'}\n\n`;
    index++;
  }

  if (index === 1) {
    return conn.sendMessage(chatId, { text: '❌ No estoy en ningún grupo.' }, { quoted: msg });
  }

  return conn.sendMessage(chatId, { text: listaTexto.trim() }, { quoted: msg });
};

handler.command = ['listgrupos', 'vergrupos', 'todosgrupos'];
module.exports = handler;