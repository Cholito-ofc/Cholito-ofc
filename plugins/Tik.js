const axios = require("axios");

const handler = async (msg, { conn, args, command, usedPrefix }) => {
  const texto = args.join(" ");
  const emoji = '📱';
  const reaccion = '🔍';

  if (!texto) {
    return conn.sendMessage(msg.chat, {
      text: `╭─⬣「 *TIKTOK SEARS* 」⬣
│ ${emoji} *Uso correcto:*
│ ✦ ${usedPrefix + command} funny cats
╰────────────⬣`,
    });
  }

  await conn.sendMessage(msg.chat, { react: { text: reaccion, key: msg.key }});

  try {
    const res = await axios.get(`https://api.dorratz.com/v2/tiktok-s?q=${encodeURIComponent(texto)}`);
    const resultados = res.data.result || [];

    if (resultados.length === 0) {
      return conn.sendMessage(msg.chat, {
        text: `❌ No se encontraron resultados para: *${texto}*`,
      });
    }

    for (let i = 0; i < Math.min(5, resultados.length); i++) {
      const vid = resultados[i];
      await conn.sendMessage(msg.chat, {
        video: { url: vid.play },
        caption: `🎬 *${vid.title || "Sin título"}*\n👤 *${vid.author.name || "Autor desconocido"}*`,
      });
    }

  } catch (e) {
    console.error(e);
    return conn.sendMessage(msg.chat, {
      text: `🚫 Error al buscar videos.\nIntenta de nuevo más tarde.`,
    });
  }
};

handler.command = ["tiktoksears", "tiktoksearch", "ttsearch"];
handler.help = ["tiktoksears <texto>"];
handler.tags = ["tiktok"];
handler.register = true;
handler.premium = false;
handler.limit = false;

module.exports = handler;