const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const LIMIT_MB = 100;
const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 12000;

const SYLPHY_API_KEY = "Sylphiette's";

function isUserBlocked(userId) {
  try {
    const blockedUsers = JSON.parse(fs.readFileSync('./bloqueados.json', 'utf8'));
    return blockedUsers.includes(userId);
  } catch {
    return false;
  }
}

async function getDownloadLinks(url) {
  const audioApi = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(url)}&apikey=${SYLPHY_API_KEY}`;
  const videoApi = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&apikey=${SYLPHY_API_KEY}`;
  return { audioApi, videoApi };
}

async function sendAudio(conn, chatId, audioUrl, title, quotedMsg) {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await conn.sendMessage(
        chatId,
        { audio: { url: audioUrl }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` },
        { quoted: quotedMsg }
      );
      return true;
    } catch {
      if (attempt < MAX_RETRIES - 1) await wait(RETRY_DELAY_MS);
    }
  }
  return false;
}

async function sendVideo(conn, chatId, videoUrl, title, quotedMsg) {
  try {
    const head = await axios.head(videoUrl);
    const sizeMB = parseInt(head.headers['content-length'], 10) / (1024 * 1024);
    const asDocument = sizeMB >= LIMIT_MB;

    await conn.sendMessage(
      chatId,
      { video: { url: videoUrl }, mimetype: 'video/mp4', fileName: `${title}.mp4` },
      { quoted: quotedMsg, sendMediaAsDocument: asDocument }
    );
  } catch (error) {
    throw new Error('No se pudo enviar el video.');
  }
}

const handler = async (msg, { conn, args, command }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, '');

  await conn.sendMessage(chatId, { react: { text: '🎶', key: msg.key } });

  if (isUserBlocked(senderNum)) {
    return conn.sendMessage(chatId, { text: '🚫 Lo siento, estás en la lista de usuarios bloqueados.' }, { quoted: msg });
  }

  if (!args || !args.join(' ').trim()) {
    return conn.sendMessage(chatId, {
      text: `╭─⬣「 *KilluaBot* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ .play Anuel perfecto
╰─⬣
> © ⍴᥆ᥕᥱrᥱძ ᑲᥡ һᥒ ᥴһ᥆ᥣі𝗍᥆`,
    }, { quoted: msg });
  }

  const query = args.join(' ').trim();

  try {
    const searchResults = await yts(query);
    if (!searchResults?.videos?.length) throw new Error('No se encontraron resultados.');

    const videoInfo = searchResults.videos[0];
    const { title, timestamp: duration, url: videoUrl, image: thumbnail } = videoInfo;

    let imageBuffer = null;
    try {
      const response = await axios.get(thumbnail, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data, 'binary');
    } catch {}

    const caption = `╭─⬣「 *𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 𝖬𝗎́𝗌𝗂𝖼* 」⬣
│  🎵 *Título:* ${title}
│  ⏱ *Duración:* ${duration || 'Desconocida'}
│  🔗 *URL:* ${videoUrl}
╰─⬣

*[🛠️] 𝖯𝗋𝗈𝖼𝖾𝗌𝖺𝗇𝖽𝗈 𝗌𝗎 𝗌𝗈𝗅𝗂𝖼𝗂𝗍𝗎𝖽...*

> ® ⍴᥆ᥕᥱrᥱძ ᑲᥡ 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍⚡`;

    await conn.sendMessage(chatId, { image: imageBuffer, caption: caption }, { quoted: msg });

    const { audioApi, videoApi } = await getDownloadLinks(videoUrl);

    if (command === 'play') {
      const res = await axios.get(audioApi, { timeout: TIMEOUT_MS });
      if (!res.data.status) throw new Error('No se pudo obtener el audio.');

      await sendAudio(conn, chatId, res.data.res.downloadURL, res.data.res.title, msg);

    } else if (['play2', 'playvid'].includes(command)) {
      const res = await axios.get(videoApi, { timeout: TIMEOUT_MS });
      if (!res.data.status) throw new Error('No se pudo obtener el video.');

      await sendVideo(conn, chatId, res.data.res.url, res.data.res.title, msg);
    }

    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (error) {
    return conn.sendMessage(chatId, {
      text: `➤ \`UPS, ERROR\` ❌

𝖯𝗋𝗎𝖾𝖻𝖾 𝗎𝗌𝖺𝗋 *.𝗌𝗉𝗈𝗍𝗂𝖿𝗒* *.𝗋𝗈𝗅𝗂𝗍𝖺* 𝗈 *.𝗉𝗅𝖺𝗒𝗒*
".𝗋𝖾𝗉𝗈𝗋𝗍𝖾 𝗇𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 .play"
> 𝖤𝗅 𝖾𝗊𝗎𝗂𝗉𝗈 𝗅𝗈 𝗋𝖾𝗏𝗂𝗌𝖺𝗋𝖺 𝗍𝖺𝗇 𝗉𝗋𝗈𝗇𝗍𝗈. 🚔`
    }, { quoted: msg });
  }
};

handler.command = ['play', 'play2', 'playvid'];
module.exports = handler;