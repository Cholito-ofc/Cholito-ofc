const axios = require('axios');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  if (!args.length) {
    return await conn.sendMessage(chatId, {
      text: `⚠️ *Uso incorrecto.*\n📌 Ejemplo: ${global.prefix}tik Messi`,
      mentions: [sender]
    }, { quoted: msg });
  }

  const query = args.join(" ");

  await conn.sendMessage(chatId, {
    react: { text: "⏳", key: msg.key }
  });

  try {
    const apiUrl = `https://latam-api.vercel.app/api/tiktoksearch?query=${encodeURIComponent(query)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.ok || !response.data.data || response.data.data.length === 0) {
      throw new Error("No se encontraron resultados.");
    }

    const videos = response.data.data.slice(0, 5);

    await conn.sendMessage(chatId, {
      text: `🔍 *Resultados para:* "${query}"\n🎥 Enviando los primeros ${videos.length} videos.`,
      mentions: [sender]
    }, { quoted: msg });

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const videoUrl = video.play || video.video;

      await conn.sendMessage(chatId, {
        video: { url: videoUrl, mimetype: 'video/mp4' },
        caption: `🎬 *${video.title || 'Video TikTok'}*\n👤 @${video.author.name || 'desconocido'}`,
      }, { quoted: msg });
    }

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    });

  } catch (error) {
    console.error("❌ Error en comando .tik:", error);
    await conn.sendMessage(chatId, {
      text: `❌ *Ocurrió un error al buscar o enviar los videos:*\n_${error.message}_`,
      mentions: [sender]
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    });
  }
};

handler.command = ['tik'];
module.exports = handler;