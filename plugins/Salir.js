const handler = async (msg, { conn, args }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '🚫 Solo el *owner* puede usar este comando.'
    }, { quoted: msg });
  }

  const index = parseInt(args[0]);
  if (isNaN(index)) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '✳️ Usa el comando así:\n*.salir 2* (para salir del grupo número 2)'
    }, { quoted: msg });
  }

  const chats = Object.values(conn.chats).filter(v => v.id.endsWith("@g.us"));
  const target = chats[index - 1];

  if (!target) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '❌ No se encontró el grupo con ese número.'
    }, { quoted: msg });
  }

  await conn.sendMessage(target.id, {
    text: '👋 El bot se retirará de este grupo por orden del owner.'
  });

  await conn.groupLeave(target.id);
  conn.sendMessage(msg.key.remoteJid, {
    text: `✅ El bot salió del grupo número ${index}.`
  }, { quoted: msg });
};

handler.command = ['salir'];
module.exports = handler;