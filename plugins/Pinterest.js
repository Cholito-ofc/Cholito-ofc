const axios = require('axios');

const handler = async (msg, { conn, args, text, command }) => {
  const query = text || args.join(" ");
  if (!query) return msg.reply(`⚠️ *Uso incorrecto del comando*\n\nEjemplo: *.${command} gato*`);

  try {
    const apikey = 'rusellxyz';
    const url = `https://api.neoxr.eu/api/pinterest?q=${encodeURIComponent(query)}&apikey=${apikey}`;
    
    const { data } = await axios.get(url);
    const result = data.data;

    if (!result || result.length === 0) {
      return msg.reply(`⚠️ No se encontraron resultados para: *${query}*`);
    }

    const randomImage = result[Math.floor(Math.random() * result.length)];
    await conn.sendMessage(msg.chat, { image: { url: randomImage }, caption: `🔍 Resultado para: *${query}*` }, { quoted: msg });

  } catch (e) {
    console.error(e);
    msg.reply(`❌ Error al buscar imágenes.\nIntenta de nuevo más tarde.`);
  }
};

handler.command = ['pinterest', 'pin', 'pint'];
handler.help = ['pinterest <texto>'];
handler.tags = ['imagen', 'buscador'];

module.exports = handler;