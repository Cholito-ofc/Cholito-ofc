const fetch = require('node-fetch')

let handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid

  if (!msg.messageStubType || msg.messageStubType !== 27) return // tipo 27 = nuevo participante

  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {}
  const isWelcomeOn = global.db.data.chats[chatId].welcome
  if (!isWelcomeOn) return

  const group = await conn.groupMetadata(chatId)
  const participants = msg.messageStubParameters || []

  for (let user of participants) {
    try {
      const name = (await conn.onWhatsApp(user))[0]?.notify || 'Nuevo Usuario'
      const members = group.participants.length
      const groupName = group.subject
      const pfp = await conn.profilePictureUrl(user, 'image').catch(() => 'https://i.imgur.com/5LzZk1A.png')

      const imgURL = `https://api.lolhuman.xyz/api/card/welcome?apikey=TuApiKey&pp=${encodeURIComponent(pfp)}&name=${encodeURIComponent(name)}&bg=https://i.imgur.com/OJ1kTgF.jpg&gcname=${encodeURIComponent(groupName)}&member=${members}&username=@${user.split('@')[0]}`

      const buffer = await fetch(imgURL).then(res => res.buffer())

      const texto = `
👋 ¡Bienvenido(a) @${user.split('@')[0]}!
📌 Grupo: *${groupName}*
👥 Miembros: *${members}*

✨ Presentate y disfruta del grupo.
`.trim()

      await conn.sendMessage(chatId, {
        image: buffer,
        caption: texto,
        mentions: [user]
      })

    } catch (e) {
      console.log('⚠️ Error en welcome:', e)
    }
  }
}

handler.customPrefix = /^$/
handler.group = true
handler.botAdmin = true
handler.listen = true

module.exports = handler