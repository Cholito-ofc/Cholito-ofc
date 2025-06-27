const yts = require('yt-search');
const axios = require('axios');

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  await conn.sendMessage(chatId, { react: { text: '🎶', key: msg.key } });

  if (!args || !args.join(" ").trim()) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ .play Anuel - Mejor Que Yo
╰─⬣
> ® 𝖯𝗈𝗐𝖾𝗋𝖾𝖽 𝖻𝗒 𝖢𝗁𝗈𝗅𝗂𝗍𝗈`,
    }, { quoted: msg });
  }

  const query = args.join(" ").trim();

  try {
    const results = await yts(query);
    const video = results.videos[0];
    if (!video) throw new Error("❌ No se encontró ningún video.");

    const { title, timestamp: duration, views, ago, url, thumbnail, author } = video;

    const text = `╭─⬣「 *KilluaBot Music* 」⬣
│ 🎵 *Título:* ${title}
│ 🎬 *Duración:* ${duration}
│ 👀 *Vistas:* ${views.toLocaleString()}
│ 📺 *Canal:* ${author.name}
│ 📅 *Publicado:* ${ago}
╰─⬣
🔗 *Link:* ${url}
> 𝖲𝖾 𝖾𝗌𝗍𝖺 𝖻𝗎𝗌𝖼𝖺𝗇𝖽𝗈 𝖾𝗅 𝖺𝗎𝖽𝗂𝗈... 🎧`;

    // Descargar thumbnail como buffer
    let thumbBuffer;
    try {
      const response = await axios.get(thumbnail, { responseType: "arraybuffer" });
      thumbBuffer = Buffer.from(response.data, "binary");
    } catch {
      thumbBuffer = null;
    }

    const preview = {
      contextInfo: {
        externalAdReply: {
          title: title,
          body: '🎧 KilluaBot',
          mediaType: 1,
          previewType: 0,
          thumbnail: thumbBuffer,
          sourceUrl: url,
          renderLargerThumbnail: true
        }
      }
    };

    await conn.sendMessage(chatId, {
      text
    }, {
      quoted: msg,
      ...preview
    });

  } catch (e) {
    console.error(e);
    return conn.sendMessage(chatId, {
      text: "❌ Ocurrió un error al buscar la canción. Intenta con otro nombre."
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;