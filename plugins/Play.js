const fetch = require('node-fetch');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "🥞 Por favor, ingresa el nombre de una canción.\n\nEjemplo: .play Shakira - Waka Waka"
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: '🕒', key: msg.key }
  });

  try {
    // Buscar la canción en YouTube
    const yt = await fetch(`https://api.akuari.my.id/search/ytsearch?query=${encodeURIComponent(text)}`);
    const ytJson = await yt.json();

    if (!ytJson.result || !ytJson.result[0]) {
      return conn.sendMessage(chatId, {
        text: "❌ No se encontró la canción.",
        quoted: msg
      });
    }

    const info = ytJson.result[0];
    const title = info.title;
    const artist = info.channel;
    const duration = info.duration;
    const views = info.views;
    const thumb = info.thumbnail;
    const url = info.url;

    // Descargar el audio
    const dl = await fetch(`https://api.akuari.my.id/downloader/yta?link=${encodeURIComponent(url)}`);
    const dlJson = await dl.json();

    if (!dlJson || !dlJson.mp3 || !dlJson.mp3.url) {
      return conn.sendMessage(chatId, {
        text: "❌ No se pudo descargar el audio.",
        quoted: msg
      });
    }

    // Enviar información con imagen
    await conn.sendMessage(chatId, {
      image: { url: thumb },
      caption:
        `🎵 *${title}*\n` +
        `🗣️ *Artista:* ${artist}\n` +
        `⏱️ *Duración:* ${duration}\n` +
        `👁️ *Vistas:* ${views}\n\n` +
        `🔗 ${url}\n\n` +
        `🎧 Enviando audio...`
    }, { quoted: msg });

    // Enviar el audio
    await conn.sendMessage(chatId, {
      audio: { url: dlJson.mp3.url },
      mimetype: 'audio/mpeg'
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en play:", err);
    await conn.sendMessage(chatId, {
      text: "❌ Ocurrió un error al procesar la música.",
      quoted: msg
    });
  }
};

handler.command = ["play", "ytplay", "ytmp3", "music"];
handler.tags = ["descargas"];
handler.help = ["play <nombre de la canción>", "ytplay <nombre>", "ytmp3 <nombre>", "music <nombre>"];
module.exports = handler;