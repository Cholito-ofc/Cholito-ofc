const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;

  if (!text || !text.trim()) {
    return conn.sendMessage(chatId, {
      text:
`.ttsearch: Por favor escribe un tema para buscar.\nEjemplo: .ttsearch edits`
    }, { quoted: msg });
  }

  return conn.sendMessage(chatId, {
    text: `Buscando TikTok para: ${text}`
  }, { quoted: msg });
};

// Prefijo acepta punto seguido de espacios o no
handler.customPrefix = /^\.\s*/i;
// Comando exacto "ttsearch" (aceptando espacios dentro del comando, opcional)
handler.command = /^tt\s*search$/i;

handler.tags = ["buscador"];
handler.help = ["ttsearch <tema>"];
handler.register = true;

module.exports = handler;