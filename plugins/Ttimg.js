const axios = require('axios')
const cheerio = require('cheerio')

let handler = async (m, { conn, text }) => {
  const fake = { quoted: m }
  const emoji = '📸'
  const emoji2 = '❌'
  const creator = 'KilluaBot'

  let decoded = conn.decodeJid ? conn.decodeJid(m.sender) : null
  if (!decoded) return m.reply(`${emoji2} Error al identificar al usuario.`)
  let user = decoded.user || m.sender.split('@')[0]

  if (!text) {
    return conn.sendMessage(m.chat, { text: `${emoji} Ingresa el enlace del TikTok que contiene imágenes.` }, fake)
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
      return []
    }
  }

  try {
    if (typeof m.react === 'function') await m.react('🔍')

    let imagenes = await obtenerImagenes(mainUrl)
    if (imagenes.length === 0) imagenes = await obtenerImagenes(backupUrl)

    if (imagenes.length === 0) {
      return conn.sendMessage(m.chat, { text: `${emoji2} No se encontraron imágenes en el enlace proporcionado.` }, fake)
    }

    if (typeof m.react === 'function') await m.react('🕓')

    for (let img of imagenes) {
      try {
        await conn.sendFile(m.chat, img, '', `🖼️ Imagen descargada por *${creator}*.`, m, null, fake)
        if (typeof m.react === 'function') await m.react('✅')
      } catch (err) {
        console.error('Error enviando imagen:', err)
        if (typeof m.react === 'function') await m.react('✖️')
      }
    }
  } catch (err) {
    console.error('Error general:', err)
    await conn.sendMessage(m.chat, { text: `${emoji2} Ocurrió un error al intentar procesar el enlace.` }, fake)
    if (typeof m.react === 'function') await m.react('✖️')
  }
}

handler.help = ['tiktokimg <url>']
handler.tags = ['descargas']
handler.command = ['tiktokimg', 'ttimg']
handler.group = true
handler.register = true
handler.coin = 2

module.exports = handler