const axios = require('axios')
const cheerio = require('cheerio')

let handler = async (m, { conn, text }) => {
  const emoji = '📸'
  const emoji2 = '❌'
  const fake = { quoted: m }

  if (!text) {
    return conn.sendMessage(m.chat, { text: `${emoji} Enlace de TikTok faltante.` }, fake)
  }

  const mainUrl = `https://dlpanda.com/id?url=${text}&token=G7eRpMaa`
  const backupUrl = `https://dlpanda.com/id?url=${text}&token51=G32254GLM09MN89Maa`

  const obtenerImagenes = async (url) => {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'text/html',
        }
      })
      const $ = cheerio.load(res.data)
      return $('div.col-md-12 > img').map((_, el) => $(el).attr('src')).get().filter(Boolean)
    } catch (e) {
      console.log('❌ Error al cargar página:', e.message)
      return []
    }
  }

  try {
    if (typeof m.react === 'function') await m.react('🔍')

    let imagenes = await obtenerImagenes(mainUrl)
    if (imagenes.length === 0) imagenes = await obtenerImagenes(backupUrl)

    if (imagenes.length === 0) {
      return conn.sendMessage(m.chat, { text: `${emoji2} No se encontraron imágenes.` }, fake)
    }

    for (let img of imagenes) {
      await conn.sendFile(m.chat, img, '', `🖼️ Imagen descargada`, m, null, fake)
    }

    if (typeof m.react === 'function') await m.react('✅')
  } catch (err) {
    console.error('⚠️ Error general:', err)
    return conn.sendMessage(m.chat, { text: `${emoji2} Falló el proceso.` }, fake)
  }
}

handler.help = ['tiktokimg <url>']
handler.tags = ['descargas']
handler.command = ['tiktokimg', 'ttimg']
// Elimina esto si quieres que funcione en privados:
handler.group = false

module.exports = handler