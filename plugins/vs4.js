import path from 'path'

let partidasVS4 = {}

let handler = async (m, { conn, args }) => {
  const modalidad = args.join(' ') || ''
  const idPartida = new Date().getTime().toString()

  let plantilla = `
𝟒 𝐕𝐄𝐑𝐒𝐔𝐒 𝟒

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                            
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : 
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 :                

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: ${modalidad}
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:

      𝗘𝗦𝗖𝗨𝗔𝐃𝐑𝐀 1
    
    👑 ┇  
    🥷🏻 ┇  
    🥷🏻 ┇ 
    🥷🏻 ┇  
    
    ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
    🥷🏻 ┇ 
    🥷🏻 ┇

❤️ = Participar | 👍 = Suplente
  `.trim()

  let msg = await conn.sendMessage(m.chat, { text: plantilla }, { quoted: m })

  partidasVS4[msg.key.id] = {
    chat: m.chat,
    jugadores: [],
    suplentes: [],
    originalMsgKey: msg.key,
    modalidad,
    idPartida
  }

  let filePath = path.join('./isFree', `${idPartida}.json`)
  fs.writeFileSync(filePath, JSON.stringify(partidasVS4[msg.key.id], null, 2))
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(vs4|masc4)$/i
handler.group = true
handler.admin = true

export default handler

global.conn.ev.on('messages.upsert', async ({ messages }) => {
  let m = messages[0]
  if (!m?.message?.reactionMessage) return

  let reaction = m.message.reactionMessage
  let key = reaction.key
  let emoji = reaction.text
  let sender = m.key.participant || m.key.remoteJid

  let data = partidasVS4[key.id]
  if (!data) return

  let filePath = path.join('./isFree', `${data.idPartida}.json`)
  if (!fs.existsSync(filePath)) return

  const emojisParticipar = ['❤️', '❤', '♥', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❤️‍🔥']
  const emojisSuplente = ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']

  data.jugadores = data.jugadores.filter(u => u !== sender)
  data.suplentes = data.suplentes.filter(u => u !== sender)

  if (emojisParticipar.includes(emoji)) {
    if (data.jugadores.length < 4) data.jugadores.push(sender)
  } else if (emojisSuplente.includes(emoji)) {
    if (data.suplentes.length < 2) data.suplentes.push(sender)
  } else return

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

  let jugadores = data.jugadores.map(u => `@${u.split('@')[0]}`)
  let suplentes = data.suplentes.map(u => `@${u.split('@')[0]}`)

  let plantilla = `
𝟒 𝐕𝐄𝐑𝐒𝐔𝐒 𝟒

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎                            
🇲🇽 𝐌𝐄𝐗𝐈𝐂𝐎 : 
🇨🇴 𝐂𝐎𝐋𝐎𝐌𝐁𝐈𝐀 :                

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: ${data.modalidad}
➥ 𝐉𝐔𝐆𝐀𝐃𝐎𝐑𝐄𝐒:

      𝗘𝗦𝗖𝗨𝐀𝐃𝐑𝐀 1
    
    👑 ┇ ${jugadores[0] || ''}
    🥷🏻 ┇ ${jugadores[1] || ''}
    🥷🏻 ┇ ${jugadores[2] || ''}
    🥷🏻 ┇ ${jugadores[3] || ''}
    
    ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄𝐒:
    🥷🏻 ┇ ${suplentes[0] || ''}
    🥷🏻 ┇ ${suplentes[1] || ''}

❤️ = Participar | 👍 = Suplente

• Lista Activa Por 5 Minutos
  `.trim()

  await conn.sendMessage(data.chat, { delete: data.originalMsgKey })
  let newMsg = await conn.sendMessage(data.chat, { text: plantilla, mentions: [...data.jugadores, ...data.suplentes] })

  partidasVS4[newMsg.key.id] = data
  partidasVS4[newMsg.key.id].originalMsgKey = newMsg.key
  delete partidasVS4[key.id]
})
