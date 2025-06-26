let handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const rawText = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || '';

  if (!rawText) return;

  if (rawText.startsWith('.on')) {
    await conn.sendMessage(chatId, { text: '✅ ¡Detecté el .on correctamente!' }, { quoted: msg });
  } else if (rawText.startsWith('.off')) {
    await conn.sendMessage(chatId, { text: '❌ Detecté el .off correctamente.' }, { quoted: msg });
  } else {
    await conn.sendMessage(chatId, { text: `🤔 Comando no reconocido: "${rawText}"` }, { quoted: msg });
  }
};

handler.command = ['on', 'off'];
handler.group = true;

module.exports = handler;