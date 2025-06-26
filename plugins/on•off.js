let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  const groupMetadata = await conn.groupMetadata(chatId);
  const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

  if (!isAdmin && !isOwner && !msg.key.fromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 Solo los *administradores* pueden usar este comando.",
    }, { quoted: msg });
  }

  const rawText = msg?.message?.conversation || msg?.message?.extendedTextMessage?.text || ''
  const type = (args[0] || '').toLowerCase();
  const enable = rawText.startsWith('.on');

  if (!['welcome'].includes(type)) {
    return conn.sendMessage(chatId, {
      text: `📌 Usa uno de estos comandos válidos:\n\n✅ *.on welcome*\n❌ *.off welcome*`
    }, { quoted: msg });
  }

  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {};
  global.db.data.chats[chatId][type] = enable;

  return conn.sendMessage(chatId, {
    text: `🌟 Función *${type}* ${enable ? 'ACTIVADA ✅' : 'DESACTIVADA ❌'} correctamente.`
  }, { quoted: msg });
};

handler.command = ['on', 'off'];
handler.group = true;

module.exports = handler;