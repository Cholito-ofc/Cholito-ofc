const axios = require('axios');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  if (!args.length) {
    return await conn.sendMessage(chatId, {
      text: `⚠️ *Uso incorrecto*\n📌 Ejemplo: ${global.prefix}tik https://www.tiktok.com/@usuario/video/1234567890`,
      mentions: [sender]
    }, { quoted: msg });
  }

  const urlTikTok = args[0];
  if (!urlTikTok.startsWith("https://www.tiktok.com")) {
    return await conn.sendMessage(chatId, {
      text: "❌ *La URL debe ser un enlace válido de TikTok.*",
      mentions: [sender]
    }, { quoted: msg });
  }

  const apiKey = "rusellxyz"; // Tu apikey de la API
  const apiUrl = `https://api.neoxr.eu/api/tiktok?url=${encodeURIComponent(urlTikTok)}&apikey=${apiKey}`;

  await conn.sendMessage(chatId, {
    react: { text: "⏳", key: msg.key }
  });

  try {
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.result || !response.data.result.video_url) {
      throw new Error("No se pudo obtener el video de TikTok.");
    }

    const videoUrl = response.data.result.video_url;

    await conn.sendMessage(chatId, {
      video: { url: videoUrl },
      caption: `🎬 *Video descargado de TikTok*`,
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    });

  } catch (error) {
    console.error("❌ Error en comando tik:", error.message || error);
    await conn.sendMessage(chatId, {
      text: `❌ *Error al descargar video:* ${error.message || error}`,
      mentions: [sender]
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    });
  }
};

handler.command = ["tik"];
module.exports = handler;