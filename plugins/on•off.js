let handler = async (msg, { conn, args, text }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const isOwner = global.owner.some(([id]) => id === senderNum)
  const groupMetadata = await conn.groupMetadata(chatId)
  const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin

  if (!isAdmin && !isOwner && !msg.key.fromMe) {
    return conn.sendMessage(chatId, {
      text: '🚫 Este comando solo puede usarlo un *administrador* del grupo.',
    }, { quoted: msg })
  }

  const type = (args[0] || '').toLowerCase()
  if (!['welcome'].includes(type)) {
    return conn.sendMessage(chatId, {
      text: `✳️ Usa uno de estos comandos:\n\n📥 *.on welcome*\n📤 *.off welcome*`
    }, { quoted: msg })
  }

  const enable = msg.text.startsWith('.on')
  global.db.data.chats[chatId] = global.db.data.chats[chatId] || {}
  global.db.data.chats[chatId][type] = enable

  return conn.sendMessage(chatId, {
    text: `✅ Función *${type}* ${enable ? 'activada' : 'desactivada'} correctamente.`
  }, { quoted: msg })
}

handler.command = ['on', 'off']
handler.group = true

module.exports = handler