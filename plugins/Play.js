const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

// 🔹 Obtener miniatura personalizada
const getThumbnail = async () => {
  const imageUrl = "https://cdn.russellxz.click/c87a5d88.jpeg";
  const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
};

// 🔹 Limpiar el título
const sanitize = (text) => text.replace(/[\/\\?%*:|"<>]/g, '');

// 🔹 Función personalizada para enviar audio con miniatura estilo Killua
const sendAudioKillua = async (conn, chat, filePath, title, fkontak) => {
  try {
    const buffer = fs.readFileSync(filePath);
    const thumb = await getThumbnail();

    await conn.sendMessage(chat, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      fileName: `${sanitize(title)}.mp3`,
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: title.slice(0, 100),
          body: '🎧 𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙼𝚄́𝚂𝙸𝙲',
          previewType: 'PHOTO',
          thumbnail: thumb,
          mediaType: 2,
          sourceUrl: 'https://whatsapp.com/channel/0029VbABQOU77qVUUPiUek2W'
        }
      }
    }, { quoted: fkontak });

    return true;
  } catch (e) {
    console.error('Error enviando audio:', e);
    return false;
  }
};

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;

  // ✅ Obtener número de forma segura
  const sender = (msg.key.participant || msg.participant || msg.key.remoteJid).split('@')[0];

  // ✅ Contacto tipo fkontak
  const fkontak = {
    key: {
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "kirito-bot"
    },
    message: {
      contactMessage: {
        displayName: "MediaHub-Bot",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:MediaHub;Bot;;;\nFN:MediaHub Oficial\nORG:Mediahub Team;\nTEL;waid=${sender}:${sender}\nEMAIL;type=INTERNET:soporte@mediahub.net\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };

  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";
  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const usedPrefix = prefixes[subbotID] || ".";

  if (!text) {
    return await conn.sendMessage2(chatId, {
      text: `🎵 *Uso del comando .play:*

📌 Escribe el nombre de una canción o artista.
🔍 Ejemplo: *${usedPrefix}play Coldplay Yellow*`
    }, fkontak);
  }

  await conn.sendMessage(chatId, {
    react: { text: '⏱️', key: msg.key }
  });

  try {
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) throw new Error('No se encontraron resultados');

    const videoUrl = video.url;
    const thumbnail = video.thumbnail;
    const title = video.title;
    const fduration = video.timestamp;
    const views = video.views.toLocaleString();
    const channel = video.author.name || 'Desconocido';

    const infoMessage = `*╭┈┈≫* *「 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 𝖬𝗎́𝗌𝗂𝖼 ⚡ 」≪┈┈╮*
*┊*
*┊»* 🎼 𝗧𝗶́𝘁𝘂𝗹𝗼: ${title}
*┊»* ⏱️ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼́𝗻: ${fduration}
*┊»* 👤 𝗔𝘂𝘁𝗼𝗿: ${channel}
*┊»* 👀 𝗩𝗶𝘀𝘁𝗮𝘀: ${views}
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫*
*» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧*
*» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...*

*⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻*`;

    const imageBuffer = await axios.get(thumbnail, { responseType: 'arraybuffer' }).then(res => Buffer.from(res.data));

    await conn.sendMessage(chatId, {
      text: infoMessage,
      contextInfo: {
        externalAdReply: {
          title: title.slice(0, 100),
          body: '🎧 𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙼𝚄́𝚂𝙸𝙲',
          mediaType: 1,
          previewType: 0,
          thumbnail: imageBuffer,
          sourceUrl: videoUrl,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: fkontak });

    const apiURL = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`;
    const res = await axios.get(apiURL);
    const json = res.data;

    if (!json.status || !json.data?.url) throw new Error("No se pudo obtener el audio");

    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.m4a`);
    const finalPath = path.join(tmpDir, `${Date.now()}_final.mp3`);

    const audioRes = await axios.get(json.data.url, { responseType: 'stream' });
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .format('mp3')
        .save(finalPath)
        .on('end', resolve)
        .on('error', reject);
    });

    await sendAudioKillua(conn, chatId, finalPath, title, fkontak);

    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

    await conn.sendMessage(chatId, {
      react: { text: '✅', key: msg.key }
    });

  } catch (error) {
    return conn.sendMessage(chatId, {
      text: `➤ \`UPS, ERROR\` ❌

𝖯𝗋𝗎𝖾𝖻𝖾 𝗎𝗌𝖺𝗋 *.𝗉𝗅𝖺𝗒𝗉𝗋𝗈* *.𝗌𝗉𝗈𝗍𝗂𝖿𝗒* 𝗈 *.𝗋𝗈𝗅𝗂𝗍𝖺*
".𝗋𝖾𝗉𝗈𝗋𝗍𝖾 𝗇𝗈 𝖿𝗎𝗇𝖼𝗂𝖾𝗇𝖽𝗈 .play"
> 𝖤𝗅 𝖾𝗊𝗎𝗂𝗉𝗈 𝗅𝗈 𝗋𝖾𝗏𝗂𝗌𝖺𝗋𝖺 𝗉𝗋𝗈𝗇𝗍𝗈. 🚔`
    }, { quoted: fkontak });
  }
};

handler.command = ['play'];
module.exports = handler;