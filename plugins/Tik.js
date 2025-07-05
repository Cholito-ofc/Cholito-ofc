const axios = require('axios');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  if (!args.length) {
    return await conn.sendMessage(chatId, {
      text: `⚠️ *Uso incorrecto.*\n📌 Ejemplo: ${global.prefix}tik <palabra clave>`,
      mentions: [sender]
    }, { quoted: msg });
  }

  const query = args.join(" ");

  await conn.sendMessage(chatId, {
    react: { text: "⏳", key: msg.key }
  });

  try {
    // Usamos la API pública de dorratz para búsqueda por texto
    const apiUrl = `https://api.dorratz.com/v2/tiktok-s?q=${encodeURIComponent(query)}`;

    const response = await axios.get(apiUrl);

    if (response.data.status !== 200 || !response.data.data || response.data.data.length === 0) {
      return await conn.sendMessage(chatId, {
        text: `❌ No se encontraron resultados para: "${query}"`,
        mentions: [sender]
      }, { quoted: msg });
    }

    const videos = response.data.data.slice(0, 5);

    await conn.sendMessage(chatId, {
      text: `🔍 *Enviando los primeros ${videos.length} videos para:* "${query}"`,
      mentions: [sender]
    }, { quoted: msg });

    for (const video of videos) {
      const videoUrl = video.video.no_watermark; // video sin marca de agua
      const caption = `🎬 *${video.title}*\n👤 @${video.author.username}\n❤️ ${video.like.toLocaleString()} | 💬 ${video.coment.toLocaleString()}`;

      await conn.sendMessage(chatId, {
        video: { url: videoUrl },
        caption,
      }, { quoted: msg });
    }

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    });

  } catch (error) {
    console.error("❌ Error en comando tik:", error);
    await conn.sendMessage(chatId, {
      text: `❌ *Error al buscar videos:* ${error.message || error}`,
      mentions: [sender]
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    });
  }
};

handler.command = ["tik"];
module.exports = handler;