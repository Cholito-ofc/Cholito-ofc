let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`✳️ Uso correcto:\n${usedPrefix + command} <enlace TikTok carrusel>`);

  try {
    // API que proporcionaste
    const apiUrl = `https://api.neoxr.eu/api/tiktok?url=${encodeURIComponent(text)}&apikey=rusellxyz`;

    let res = await fetch(apiUrl);
    let json = await res.json();

    if (!json || !json.data) return m.reply('❌ No se pudo obtener información del TikTok.');
    
    // Revisa si es tipo imágenes (slide)
    if (json.data.type !== 'image') return m.reply('⚠️ Este TikTok no es un carrusel de imágenes.');

    let images = json.data.images;

    if (!images || !images.length) return m.reply('❌ No se encontraron imágenes en este TikTok.');

    m.reply('⏳ Enviando imágenes...');

    for (let img of images) {
      await conn.sendFile(m.chat, img, 'tt.jpg', '', m);
      await delay(1500); // Delay para evitar que el bot se trabe
    }

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al procesar el TikTok.');
  }
};

handler.help = ['ttimg <enlace>'];
handler.tags = ['downloader'];
handler.command = /^ttimg$/i;

export default handler;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}