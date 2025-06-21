const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Error obteniendo la lista de grupos.' }, { quoted: msg });
  }

  // Extrae la base del ID del bot, sin sufijo
  const botIdBase = (conn.user.id || '').split('@')[0];

  let listaTexto = '✨ *Grupos donde soy administrador*\n\n';
  let index = 1;

  for (const id in groupMetadatas) {
    const metadata = groupMetadatas[id];
    // Extrae la base del ID de cada admin
    const adminIdsBase = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => (p.id || '').split('@')[0]);

    if (adminIdsBase.includes(botIdBase)) {
      listaTexto += `*${index}*️⃣  *${metadata.subject}*\n`;
      listaTexto += `🆔 *ID:* ${id}\n`;
      listaTexto += `👑 *Soy admin aquí*\n`;
      listaTexto += `━━━━━━━━━━━━━━━━━━━━━\n`;
      index++;
    }
  }

  if (index === 1) {
    return conn.sendMessage(chatId, { text: '🚫 No soy admin en ningún grupo.', quoted: msg });
  }
  listaTexto += `\n🤖 *Total de grupos donde soy admin:* ${index - 1}`;
  return conn.sendMessage(chatId, { text: listaTexto.trim() }, { quoted: msg });
};

handler.command = ['listgrupos', 'vergrupos', 'gruposadmin'];
module.exports = handler;