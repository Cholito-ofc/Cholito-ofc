const yts = require('yt-search');
const fs = require('fs');
const axios = require('axios');
const { ytdl } = require('@bochilteam/scraper'); // Opcional si quieres descargar mejor

module.exports = {
  name: 'play',
  alias: ['ytplay', 'yt-audio'],
  category: 'descargas',
  desc: 'Buscar y reproducir audio desde YouTube',
  use: '.play [nombre de canción]',
  async run(m, { conn, text, prefix, command }) {
    if (!text) return m.reply(`❗ *Escribe el nombre de una canción para buscar.*\n\n📌 Ejemplo:\n${prefix + command} ella baila sola`);

    try {
      // Buscar video
      let search = await yts(text);
      let vid = search.videos[0];
      if (!vid) return m.reply('❗ No se encontró ningún resultado.');

      let { title, timestamp, views, url, thumbnail, author } = vid;

      // Descargar audio
      const { audio } = await ytdl(url);
      const res = await axios.get(audio.download(), { responseType: 'arraybuffer' });

      // Enviar imagen de preview con externalAdReply (sin URL activa)
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `🎵 *Título:* ${title}\n⏱️ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views}\n🎙️ *Autor:* ${author.name}`,
        contextInfo: {
          externalAdReply: {
            title: '🔊 Reproduciendo audio',
            body: `${title}`,
            mediaType: 1,
            thumbnailUrl: thumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: false,
            sourceUrl: '' // ⚠️ Si dejas esto vacío no abre enlace
          }
        }
      }, { quoted: m });

      // Espera para evitar bloqueos
      await new Promise(res => setTimeout(res, 2000));

      // Enviar audio como documento (puedes cambiar a audio normal si prefieres)
      await conn.sendMessage(m.chat, {
        document: Buffer.from(res.data),
        fileName: `${title}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      m.reply('❌ Error al procesar el comando.');
    }
  }
};