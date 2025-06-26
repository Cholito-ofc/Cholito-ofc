const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const fetch = require('node-fetch')

let handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid

  if (!msg.messageStubType) return

  const isWelcomeOn = global.db.data.chats[chatId]?.welcome
  if (!isWelcomeOn) return

  let groupMetadata = await conn.groupMetadata(chatId)
  let participants = msg.messageStubParameters || []
  for (let user of participants) {
    try {
      let profilePic = await conn.profilePictureUrl(user, 'image').catch(() => null)
      let name = (await conn.onWhatsApp(user))[0]?.notify || 'Usuario'
      let groupName = groupMetadata.subject
      let members = groupMetadata.participants.length

      // Generar imagen usando API externa de bienvenida
      let imgURL = `https://api.lolhuman.xyz/api/card/welcome?apikey=TuApiKey&pp=${encodeURIComponent(profilePic || '')}&name=${encodeURIComponent(name)}&bg=https://i.imgur.com/OJ1kTgF.jpg&gcname=${encodeURIComponent(groupName)}&member=${members}&username=@${user.split('@')[0]}`

      let buffer = await fetch(imgURL).then(res => res.buffer())

      let texto = `
🌟 *BIENVENIDO(A)* 🌟

👤 𝗡𝗼𝗺𝗯𝗿𝗲: @${user.split('@')[0]}
👥 𝗚𝗿𝘂𝗽𝗼: ${groupName}
🔢 𝗠𝗶𝗲𝗺𝗯𝗿𝗼𝘀: ${members}

📝 No olvides leer las reglas y presentarte.

`.trim()

      await conn.sendMessage(chatId, {
        image: buffer,
        caption: texto,
        mentions: [user]
      })

    } catch (e) {
      console.log("Error en welcome:", e)
    }
  }
}

handler.customPrefix = /^$/ // No responde a comandos
handler.group = true
handler.botAdmin = true
handler.listen = true

module.exports = handler