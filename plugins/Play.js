const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');

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
      const search = await yts(text);
      const video = search.videos[0];
      if (!video) return m.reply('❗ No se encontró ningún resultado.');

      const { title, url, timestamp, views, thumbnail, author } = video;

      // Enviar imagen con externalAdReply (sin URL clickeable)
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `🎵 *Título:* ${title}\n⏱️ *Duración:* ${timestamp}\n👁️ *Vistas:* ${views}\n🎙️ *Autor:* ${author.name}`,
        contextInfo: {
          externalAdReply: {
            title: '🔊 Reproduciendo audio',
            body: title,
            mediaType: 1,
            thumbnailUrl: thumbnail,
            renderLargerThumbnail: true,
            showAdAttribution: false,
            sourceUrl: '' // Así no es clickeable
          }
        }
      }, { quoted: m });

      // Descargar audio usando servicio externo (ejemplo con anoboy API)
      const api = `https://aemt.me/download/yta?url=${encodeURIComponent(url)}`;
      const res = await axios.get(api);
      if (!res.data || !res.data.dl_url) return m.reply('❌ No se pudo descargar el audio.');

      const audioData = await axios.get(res.data.dl_url, { responseType: 'arraybuffer' });

      await conn.sendMessage(m.chat, {
        document: Buffer.from(audioData.data),
        fileName: `${title}.mp3`,
        mimetype: 'audio/mpeg'
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      m.reply('❌ Ocurrió un error al procesar el comando.');
    }
  }
};