const axios = require('axios')
const fetch = require('node-fetch')

let handler = async (msg, { conn, text, args, usedPrefix, command }) => {
  let chatId = msg.chat

  if (!text) {
    return msg.reply(`✳️ Ejemplo de uso:\n${usedPrefix + command} edits messi`)
  }

  // Buscar videos
  let res = await axios.get(`https://api.siputzx.my.id/api/search/tiktok?query=${encodeURIComponent(text)}`)
  let resultados = res.data.result || []

  if (!resultados.length) {
    return msg.reply('❌ No se encontraron resultados.')
  }

  let lista = resultados.slice(0, 10).map((v, i) => `*${i + 1}.* ${v.title || 'Sin título'}`).join('\n\n')
  await conn.sendMessage(chatId, {
    text: `🔍 *Resultados encontrados:*\n\n${lista}\n\n📌 Responde con un número del *1 al ${Math.min(10, resultados.length)}* para descargar esa cantidad de videos.`,
    contextInfo: {
      externalAdReply: {
        title: 'Resultado TikTok',
        body: 'Pulsa para ver',
        thumbnailUrl: resultados[0]?.thumbnail,
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: resultados[0]?.url
      }
    }
  }, { quoted: msg })

  // Esperar respuesta del usuario
  conn.tiktokSearch = conn.tiktokSearch || {}
  conn.tiktokSearch[chatId] = {
    resultados,
    quien: msg.sender,
    tiempo: +new Date
  }
}

handler.before = async function (msg, { conn }) {
  let chatId = msg.chat
  let entrada = conn.tiktokSearch?.[chatId]
  if (!entrada) return
  if (msg.sender !== entrada.quien) return

  let num = parseInt(msg.text)
  if (!num || num < 1 || num > 10) {
    msg.reply('❗ Ingresa un número válido entre 1 y 10.')
    return true
  }

  delete conn.tiktokSearch[chatId]
  let seleccion = entrada.resultados.slice(0, num)

  msg.reply(`⏳ Descargando ${num} video(s)...`)
  for (let v of seleccion) {
    try {
      let res = await fetch(`https://api.siputzx.my.id/api/download/tiktok?url=${encodeURIComponent(v.url)}`)
      let json = await res.json()
      let video = json.result.video || json.result.url
      if (!video) continue

      await conn.sendMessage(chatId, { video: { url: video }, caption: v.title || 'Video TikTok' })
    } catch (e) {
      await msg.reply(`❌ Error con el video: ${v.title}`)
    }
  }

  return true
}

handler.command = ['ttsearch']
handler.register = true
handler.limit = false
handler.tags = ['downloader']
handler.help = ['ttsearch <texto>']

module.exports = handler