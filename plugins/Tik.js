const axios = require('axios');

const apis = [
  {
    name: 'Dorratz',
    search: async (query) => {
      const url = `https://api.dorratz.com/v2/tiktok-s?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data.status === 200 && res.data.data && res.data.data.length) {
        return res.data.data;
      }
      throw new Error('No data from Dorratz');
    }
  },
  {
    name: 'TikApi (by Nekos)',
    search: async (query) => {
      const url = `https://api.nekos.fun/api/tiktok?query=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data.status === 'ok' && res.data.data && res.data.data.length) {
        return res.data.data;
      }
      throw new Error('No data from Nekos API');
    }
  },
  {
    name: 'Alternative API',
    search: async (query) => {
      const url = `https://api2.musicaldown.com/search?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data && res.data.results && res.data.results.length) {
        // Adaptar resultados a formato común
        return res.data.results.map(v => ({
          title: v.title || 'TikTok video',
          author: { username: v.author || 'unknown' },
          like: v.likes || 0,
          coment: v.comments || 0,
          video: { no_watermark: v.url }
        }));
      }
      throw new Error('No data from Alternative API');
    }
  }
];

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!args.length) {
    return conn.sendMessage(chatId, {
      text: `⚠️ *Uso incorrecto*\nEjemplo: ${global.prefix}tik <palabra clave>`,
      mentions: [sender]
    }, { quoted: msg });
  }

  const query = args.join(' ');

  await conn.sendMessage(chatId, {
    react: { text: "⏳", key: msg.key }
  });

  let videos = null;
  let usedApi = null;

  for (const api of apis) {
    try {
      videos = await api.search(query);
      if (videos && videos.length) {
        usedApi = api.name;
        break;
      }
    } catch (e) {
      // console.log(`API ${api.name} falló: ${e.message}`);
      continue; // probar siguiente API
    }
  }

  if (!videos) {
    await conn.sendMessage(chatId, {
      text: `❌ *No se encontraron videos para:* "${query}".\nIntenté varias APIs sin éxito.`,
      mentions: [sender]
    }, { quoted: msg });
    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    });
    return;
  }

  await conn.sendMessage(chatId, {
    text: `🔍 *Videos encontrados con la API:* ${usedApi}\nMostrando hasta 5 resultados para: "${query}"`,
    mentions: [sender]
  }, { quoted: msg });

  for (let i = 0; i < Math.min(5, videos.length); i++) {
    const video = videos[i];
    try {
      await conn.sendMessage(chatId, {
        video: { url: video.video.no_watermark, mimetype: 'video/mp4' },
        caption: `🎬 *${video.title || 'Video TikTok'}*\n👤 @${video.author.username || 'desconocido'}\n❤️ ${video.like?.toLocaleString() || 0} | 💬 ${video.coment?.toLocaleString() || 0}`
      }, { quoted: msg });
    } catch {
      // Si no se puede enviar video, enviar enlace como texto
      await conn.sendMessage(chatId, {
        text: `🎬 *${video.title || 'Video TikTok'}*\n👤 @${video.author.username || 'desconocido'}\n🔗 ${video.video.no_watermark}`
      }, { quoted: msg });
    }
  }

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ['tik'];
module.exports = handler;