let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const isOwner = global.owner.some(([id]) => id === senderNum)

  const meta = await conn.groupMetadata(chatId)
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin

  if (!isAdmin && !isOwner && !msg.key.fromMe) {
    return conn.sendMessage(chatId, { text: '❌ Solo *admins* pueden activar o desactivar funciones.' }, { quoted: msg })
  }

  const type = (args[1] || '').toLowerCase()

  if (!['welcome'].includes(type)) {
    return conn.sendMessage(chatId, {
      text: '✳️ Usa:\n*.on welcome* — Activa bienvenida\n*.off welcome* — Desactiva bienvenida'
    }, { quoted: msg })
  }

  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {}

  const enable = msg.text.startsWith('.on')
  global.db.data.chats[chatId][type] = enable

  await conn.sendMessage(chatId, {
    text: enable
      ? `✅ Función *${type}* ACTIVADA`
      : `🚫 Función *${type}* DESACTIVADA`
  }, { quoted: msg })
}

handler.command = ['on', 'off']
module.exports = handler