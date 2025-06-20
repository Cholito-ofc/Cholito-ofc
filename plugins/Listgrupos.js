const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  global.gruposAdmin = [];

  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Ocurrió un error al obtener la lista de grupos.' }, { quoted: msg });
  }

  let listaTexto = '✨ *Grupos donde soy administrador*\n\n';
  let index = 1;
  // Corrección aquí
  const botId = conn.user.id.endsWith('@s.whatsapp.net') ? conn.user.id : conn.user.id + '@s.whatsapp.net';

  for (const id in groupMetadatas) {
    const metadata = groupMetadatas[id];
    // Busca todos los administradores
    const admins = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);

    const esAdmin = admins.includes(botId);

    if (esAdmin) {
      global.gruposAdmin.push({ id, name: metadata.subject });
      listaTexto += `*${index}*️⃣  *${metadata.subject}*\n`;
      listaTexto += `🆔 *ID:* ${id}\n`;
      listaTexto += `👑 *Soy administrador en este grupo*\n`;
      listaTexto += `━━━━━━━━━━━━━━━━━━━━━\n`;
      index++;
    }
  }

  if (index === 1) {
    return conn.sendMessage(chatId, { text: '🚫 No soy administrador en ningún grupo.', quoted: msg });
  }

  listaTexto += `\n🤖 *Total de grupos donde soy admin:* ${index - 1}`;

  return conn.sendMessage(chatId, { text: listaTexto.trim() }, { quoted: msg });
};

handler.command = ['listgrupos', 'vergrupos', 'gruposadmin'];
module.exports = handler;