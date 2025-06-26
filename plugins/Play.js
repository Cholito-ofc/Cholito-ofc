const yts = require('yt-search');
const axios = require('axios');

const wait = (ms) => new Promise(res => setTimeout(res, ms));

// ⚙️ Nuevo Scraper: yt-download.org backend
async function getDownloadUrl(videoUrl) {
  try {
    const { data } = await axios.get(`https://yt-download.org/api/button/mp3/${extractVideoId(videoUrl)}`, {
      timeout: 15000
    });

    const match = data.match(/href="(https:\/\/[^"]+\.mp3[^"]*)"/);
    if (!match || !match[1]) return null;

    return {
      url: match[1],
      title: 'audio'
    };
  } catch (e) {
    console.error('[SCRAPER ERROR]', e);
    return null;
  }
}

// 🎯 Extrae el ID de un video de YouTube
function extractVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|\&|$)/);
  return match ? match[1] : null;
}

async function sendAudio(conn, chatId, audioUrl, quotedMsg, fileName) {
  try {
    await conn.sendMessage(
      chatId,
      {
        audio: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName
      },
      { quoted: quotedMsg }
    );
    return true;
  } catch {
    return false;
  }
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderMention = '@' + sender.split('@')[0];

  if (!args.length) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso:* .play Karol G - Amargura
╰─⬣`
    }, { quoted: msg });
  }

  const query = args.join(" ");
  await conn.sendMessage(chatId, { react: { text: '🎵', key: msg.key } });

  try {
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) throw new Error('❌ No se encontró ningún video.');

    const { title, timestamp, url: videoUrl, author, image } = video;

    const download = await getDownloadUrl(videoUrl);
    if (!download?.url) throw new Error('❌ No se pudo obtener el enlace de descarga.');

    const caption = `🎶 *PLAY AUDIO*

🎧 *Título:* ${title}
🎤 *Artista:* ${author.name}
⏱️ *Duración:* ${timestamp}
🔗 *URL:* ${videoUrl}

👤 *Pedido por:* ${senderMention}
⏳ *Enviando audio...*`;

    await conn.sendMessage(chatId, {
      image: { url: image },
      caption,
      mentions: [sender]
    }, { quoted: msg });

    await sendAudio(conn, chatId, download.url, msg, `${title}.mp3`);
    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error('[.play error]', e);
    await conn.sendMessage(chatId, {
      text: `❌ *Error al procesar la canción*\n\n${e.message || e}`
    }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
  }
};

handler.command = ['play', 'musica', 'song'];
module.exports = handler;