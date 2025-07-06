const axios = require('axios')
const fetch = require('node-fetch')

let handler = async (msg, { conn, text, usedPrefix, command }) => {
  let chatId = msg.chat

  if (!text) {
    return await conn.sendMessage(chatId, { text: `✳️ Ejemplo de uso:\n${usedPrefix + command} edits messi` }, { quoted: msg })
  }

  let res
  try {
    res = await axios.get(`https://api.siputzx.my.id/api/search/tiktok?query=${encodeURIComponent(text)}`)
  } catch (e) {
    return await conn.sendMessage(chatId, { text: `❌ Error al buscar: ${e.message}` }, { quoted: msg })
  }

  let resultados = res.data?.result || []
  if (!resultados.length) {
    return await conn.sendMessage(chatId, { text: '❌ No se encontraron resultados.' }, { quoted: msg })
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

  conn.ttsearch = conn.ttsearch || {}
  conn.ttsearch[chatId] = {
    resultados,
    quien: msg.sender,
    tiempo: Date.now()
  }
}

handler.before = async function (msg, { conn }) {
  const chatId = msg.chat
  const entrada = conn.ttsearch?.[chatId]
  if (!entrada) return
  if (msg.sender !== entrada.quien) return

  const num = parseInt(msg.text)
  if (!num || num < 1 || num > 10) {
    await conn.sendMessage(chatId, { text: '❗ Ingresa un número válido entre 1 y 10.' }, { quoted: msg })
    return true
  }

  delete conn.ttsearch[chatId]
  const seleccion = entrada.resultados.slice(0, num)

  await conn.sendMessage(chatId, { text: `⏳ Descargando ${num} video(s)...` }, { quoted: msg })

  for (let v of seleccion) {
    try {
      let res = await fetch(`https://api.siputzx.my.id/api/download/tiktok?url=${encodeURIComponent(v.url)}`)
      let json = await res.json()
      let video = json?.result?.video || json?.result?.url
      if (!video) continue

      await conn.sendMessage(chatId, { video: { url: video }, caption: v.title || 'Video TikTok' }, { quoted: msg })
    } catch (e) {
      await conn.sendMessage(chatId, { text: `❌ Error al enviar: ${v.title}` }, { quoted: msg })
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