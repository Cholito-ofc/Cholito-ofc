const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const getThumbnail = async () => {
  const imageUrl = "https://cdn.russellxz.click/c87a5d88.jpeg";
  const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
};

const sanitize = (text) => text.replace(/[\/\\?%*:|"<>]/g, '');

const sendAudioKillua = async (conn, chat, filePath, title) => {
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
          body: '𝗞𝗶𝗹𝗹𝘂𝗮𝗕𝗼𝘁 𝗠𝘂́𝘀𝗶𝗰 ⚡',
          previewType: 'PHOTO',
          thumbnail: thumb,
          mediaType: 2,
          sourceUrl: 'https://whatsapp.com/channel/0029VbABQOU77qVUUPiUek2W'
        }
      }
    });

    return true;
  } catch (e) {
    console.error('Error enviando audio:', e);
    return false;
  }
};

const handler = async (msg, { conn }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";
  const chatId = msg.key.remoteJid;

  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const usedPrefix = prefixes[subbotID] || ".";

  // 🧠 Detectar texto del mensaje
  let body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  body = body.trim();

  // 🧩 Detectar comando (ej: .play, . Play, .pLaY, etc)
  const match = body.match(new RegExp(`^\\${usedPrefix}\\s*play`, "i"));
  if (!match) return;

  const text = body.slice(match[0].length).trim();
  if (!text) {
    return conn.sendMessage2(chatId, {
      text: `*╭┈〔 ⚠️ USO INCORRECTO ⚠️ 〕┈╮*
*┊*
*┊* 🎧 𝖤𝗌𝖼𝗋𝗂𝖻𝖾: *${usedPrefix}𝗉𝗅𝖺𝗒 𝖠𝗋𝗍𝗂𝗌𝗍𝖺 / 𝖢𝖺𝗇𝖼𝗂𝗈́𝗇* 
*┊* 📌 𝖤𝗃𝖾𝗆𝗉𝗅𝗈: *${usedPrefix}𝗉𝗅𝖺𝗒 𝖡𝖺𝖽 𝖡𝗎𝗇𝗇𝗒 𝖣𝗂𝗅𝖾𝗌* 
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫*`
    }, msg);
  }

  await conn.sendMessage(chatId, {
    react: { text: '⏱️', key: msg.key }
  });

  try {
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) throw new Error('No se encontraron resultados');

    const { url: videoUrl, thumbnail, title, timestamp: fduration, views, author } = video;
    const channel = author.name || 'Desconocido';

    const infoMessage = `*╭┈┈≫* *「 𝖪𝗂𝗅𝗅𝗎𝖺𝖡𝗈𝗍 𝖬𝗎́𝗌𝗂𝖼 ⚡ 」≪┈┈╮*
*┊*
*┊»* 🎵 𝗧𝗶́𝘁𝘂𝗹𝗼: ${title}
*┊»* ⏱️ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼́𝗻: ${fduration}
*┊»* 👤 𝗔𝘂𝘁𝗼𝗿: ${channel}
*┊»* 👀 𝗩𝗶𝘀𝘁𝗮𝘀: ${views.toLocaleString()}
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫*
*» 𝘌𝘕𝘝𝘐𝘈𝘕𝘋𝘖 𝘈𝘜𝘋𝘐𝘖  🎧*
*» 𝘈𝘎𝘜𝘈𝘙𝘋𝘌 𝘜𝘕 𝘗𝘖𝘊𝘖...*

*⇆‌ ㅤ◁ㅤㅤ❚❚ㅤㅤ▷ㅤ↻*`;

    await conn.sendMessage(chatId, {
      image: { url: thumbnail },
      caption: infoMessage
    }, { quoted: msg });

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

    await sendAudioKillua(conn, chatId, finalPath, title);

    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

    await conn.sendMessage(chatId, {
      react: { text: '✅', key: msg.key }
    });

  } catch (error) {
    return conn.sendMessage(chatId, {
      text: `➤ \`UPS, ERROR\` ❌

𝖯𝗋𝗎𝖾𝖻𝖾 𝗎𝗌𝖺𝗋 *.𝗉𝗅𝖺𝗒𝗉𝗋𝗈* *.𝗌𝗉𝗈𝗍𝗂𝖿𝗒* 𝗈 *.𝗋𝗈𝗅𝗂𝗍𝖺*
".𝗋𝖾𝗉𝗈𝗋𝗍𝖾 𝗇𝗈 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖺 .play"
> 𝖤𝗅 𝖾𝗊𝗎𝗂𝗉𝗈 𝗅𝗈 𝗋𝖾𝗏𝗂𝗌𝖺𝗋𝖺 𝗉𝗋𝗈𝗇𝗍𝗈. 🚔`
    }, { quoted: msg });
  }
};

handler.command = ["play"];
module.exports = handler;