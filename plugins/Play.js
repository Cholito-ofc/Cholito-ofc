const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);
const fetch = require("node-fetch");

// 🔹 Obtener miniatura personalizada
const getThumbnail = async () => {
  const imageUrl = "https://cdn.russellxz.click/c87a5d88.jpeg";
  const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
};

// 🔹 Limpiar el título para que no tenga caracteres prohibidos
const sanitize = (text) => text.replace(/[\/\\?%*:|"<>]/g, '');

// 🔹 Enviar audio Killua sin responder al mensaje
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

  // 🟡 Obtener texto limpio y flexible (soporte para . Play, .PLAY, etc.)
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const match = body.match(/^(\.|\!|\#)?\s*play/i);
  const text = match ? body.slice(match[0].length).trim() : "";

  // 🔹 vCard decorativo (igual al de ttsearch)
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "𝗣𝗟𝗔𝗬 - 𝗕𝗨́𝗦𝗤𝗨𝗘𝗗𝗔 🎧",
        jpegThumbnail: await (await fetch('https://iili.io/F1hbdxI.th.png')).buffer(),
        vcard: `BEGIN:VCARD
VERSION:3.0
N:;Unlimited;;;
FN:Unlimited
ORG:Unlimited
TITLE:
item1.TEL;waid=19709001746:+1 (970) 900-1746
item1.X-ABLabel:Unlimited
X-WA-BIZ-DESCRIPTION:ofc
X-WA-BIZ-NAME:Unlimited
END:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };

  if (!text) {
    return await conn.sendMessage(chatId, {
      text: `*╭┈〔 ⚠️ USO INCORRECTO ⚠️ 〕┈╮*
*┊*
*┊* 🎧 𝖤𝗌𝖼𝗋𝗂𝖻𝖾: *${usedPrefix}𝗉𝗅𝖺𝗒 𝖠𝗋𝗍𝗂𝗌𝗍𝖺 / 𝖢𝖺𝗇𝖼𝗂𝗈́𝗇* 
*┊* 📌 𝖤𝗃𝖾𝗆𝗉𝗅𝗈: *${usedPrefix}𝗉𝗅𝖺𝗒 𝖡𝖺𝖽 𝖡𝗎𝗇𝗇𝗒 𝖣𝗂𝗅𝖾𝗌* 
*╰┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈≫*`,
      quoted: fkontak
    });
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
*┊»* 🎵 𝗧𝗶́𝘁𝘂𝗹𝗼: ${title}
*┊»* ⏱️ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼́𝗻: ${fduration}
*┊»* 👤 𝗔𝘂𝘁𝗼𝗿: ${channel}
*┊»* 👀 𝗩𝗶𝘀𝘁𝗮𝘀: ${views}
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

handler.command = ['play'];
module.exports = handler;