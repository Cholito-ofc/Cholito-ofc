const fetch = require('node-fetch');

const handler = async (msg, { conn,  }) => {
  const chatId = msg.key.remoteJid;
  const text = args.join(" ").trim();

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "🥞 Por favor, ingresa el nombre de una canción de Spotify.\n\nEjemplo: spotifyplay Shakira - Waka Waka"
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: '🕒', key: msg.key }
  });

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.result || !json.result.downloadUrl) {
      return conn.sendMessage(chatId, {
        text: "❌ No se encontró la canción o hubo un error con la API.",
        quoted: msg
      });
    }

    await conn.sendMessage(chatId, {
      audio: { url: json.result.downloadUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error al descargar Spotify:", err);
    await conn.sendMessage(chatId, {
      text: "❌ Ocurrió un error al intentar obtener el audio.",
      quoted: msg
    });
  }
};

handler.command = ["spotifyplay", "music", "spotify"];
handler.tags = ["descargas"];
handler.help = ["spotifyplay <nombre de la canción>", "music <nombre>", "spotify <nombre>"];
module.exports = handler;