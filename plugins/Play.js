const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const handler = async (msg, { conn, text }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";
  const chatId = msg.key.remoteJid;

  // Prefijo personalizado
  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }

  const usedPrefix = prefixes[subbotID] || ".";

  if (!text) {
    return await conn.sendMessage(chatId, {
      text: `✳️ Usa el comando correctamente:\n\n📌 Ejemplo: *${usedPrefix}play* bad bunny diles`
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: '🕗', key: msg.key }
  });

  try {
    // Buscar video en YouTube
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) throw new Error('No se encontraron resultados');

    const videoUrl = video.url;
    const thumbnail = video.thumbnail;
    const title = video.title;
    const fduration = video.timestamp;
    const views = video.views.toLocaleString();
    const channel = video.author.name || 'Desconocido';

    const infoMessage = `╭━━〔 𝙆𝙞𝙡𝙡𝙪𝙖𝘽𝙤𝙩 𝙈𝙪𝙨𝙞𝙘 ⚡ 〕━━⬣
┃🎼 *Titulo:* ${title}
┃⏱️ *Duración:* ${fduration}
┃👤 *Autor:* ${channel}
┃👀 *Vistas:* ${views}
╰━━━━━━━━━━━━⬣

🎧 *Enviando audio... aguarde un poco.*`;

    await conn.sendMessage(chatId, {
      image: { url: thumbnail },
      caption: infoMessage
    }, { quoted: msg });

    // Descargar audio desde API externa
    const apiURL = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`;
    const res = await axios.get(apiURL);
    const json = res.data;

    if (!json.status || !json.data?.url) throw new Error("No se pudo obtener el audio");

    // Carpeta temporal
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.m4a`);
    const finalPath = path.join(tmpDir, `${Date.now()}_final.mp3`);

    // Descargar audio
    const audioRes = await axios.get(json.data.url, { responseType: 'stream' });
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

    // Convertir a MP3
    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .format('mp3')
        .save(finalPath)
        .on('end', resolve)
        .on('error', reject);
    });

    // Descargar imagen para miniatura (o usar thumbnail)
    const logoBuffer = (await axios.get('https://cdn.russellxz.click/652f01f6.jpeg', { responseType: 'arraybuffer' })).data;

    // Enviar como audio estilo MediaHub
    await conn.sendMessage(chatId, {
      audio: fs.readFileSync(finalPath),
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${title}.mp3`,
      jpegThumbnail: logoBuffer,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'KilluaBot Music',
          mediaType: 2,
          thumbnail: logoBuffer,
          showAdAttribution: true,
          sourceUrl: videoUrl
        }
      }
    }, { quoted: msg });

    // Eliminar archivos temporales
    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

    await conn.sendMessage(chatId, {
      react: { text: '✅', key: msg.key }
    });

  } catch (error) {
    console.error("❌ Error en .play:", error);
    return conn.sendMessage(chatId, {
      text: `➤ \`UPS, ERROR\` ❌

Pruebe usar *.playpro* *.spotify* o *.rolita*
".reporte no funciona .play"
> El equipo lo revisará pronto. 🚔`
    }, { quoted: msg });
  }
};

handler.command = ['play'];
module.exports = handler;