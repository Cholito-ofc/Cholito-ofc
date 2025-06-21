const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Error obteniendo grupos.' }, { quoted: msg });
  }
  // ID del bot como está en conn.user.id
  const botId = conn.user.id;
  // El mismo ID pero con @lid (por si acaso)
  const botIdLid = botId.replace(/@s\.whatsapp\.net$/, '@lid');

  let listaTexto = '✨ *Grupos donde soy administrador*\n\n';
  let index = 1;
  for (const id in groupMetadatas) {
    const metadata = groupMetadatas[id];
    const adminIds = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);

    // Compara ambos formatos de ID
    const esAdmin = adminIds.includes(botId) || adminIds.includes(botIdLid);

    if (esAdmin) {
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