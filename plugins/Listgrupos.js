const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  let groupMetadatas;
  try {
    groupMetadatas = await conn.groupFetchAllParticipating();
  } catch (e) {
    return conn.sendMessage(chatId, { text: '❌ Error obteniendo grupos.' }, { quoted: msg });
  }
  
  // Obtén tu ID de usuario, pero lo convertimos a @lid para comparar
  const botIdBase = conn.user.id.replace(/(@s\.whatsapp\.net|@lid)$/, '');

  let listaTexto = '✨ *Grupos donde soy administrador*\n\n';
  let index = 1;

  for (const id in groupMetadatas) {
    const metadata = groupMetadatas[id];
    // Busca todos los administradores
    const adminIds = metadata.participants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id);

    // Compara base del ID, sin importar el sufijo
    const esAdmin = adminIds.some(pid => pid.replace(/(@s\.whatsapp\.net|@lid)$/, '') === botIdBase);

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