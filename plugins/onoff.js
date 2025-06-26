let handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {};

  const isWelcome = global.db.data.chats[chatId].welcome ? '✅ ACTIVADO' : '❌ DESACTIVADO';

  const texto = `
🧩 *ESTADO DE FUNCIONES EN ESTE GRUPO*

📥 Bienvenida (welcome): ${isWelcome}

💬 Usa: *.on welcome* o *.off welcome*
`.trim();

  await conn.sendMessage(chatId, { text: texto }, { quoted: msg });
};

handler.command = ['onoff'];
handler.group = true;

module.exports = handler;