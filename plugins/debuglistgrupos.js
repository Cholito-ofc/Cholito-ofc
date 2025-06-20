const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Error obteniendo grupos.' }, { quoted: msg });
  }
  // Mostramos el botId y el primer grupo para comparar
  const botId = conn.user.id;
  let debug = `🤖 *DEBUG*\nBotId: ${botId}\n\n`;
  for (const id in groupMetadatas) {
    debug += `Grupo: ${groupMetadatas[id].subject}\n`;
    debug += `Participantes (primeros 5):\n`;
    debug += groupMetadatas[id].participants.slice(0,5).map(p=>`- ${p.id} (admin:${p.admin})`).join('\n')+'\n\n';
    break; // Solo el primer grupo para no saturar
  }
  return conn.sendMessage(chatId, { text: debug }, { quoted: msg });
};
handler.command = ['debuglistgrupos'];
module.exports = handler;