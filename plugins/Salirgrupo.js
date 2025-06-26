const handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '🚫 Solo el *owner* puede usar este comando.'
    }, { quoted: msg });
  }

  const chats = Object.values(conn.chats).filter(v => v.id.endsWith("@g.us"));
  let text = "*📋 Lista de grupos:*\n\n";

  const groupNames = await Promise.all(
    chats.map(async (v, i) => {
      const metadata = await conn.groupMetadata(v.id).catch(() => ({}));
      return `${i + 1}. ${metadata.subject || "Grupo sin nombre"}\nID: ${v.id}`;
    })
  );

  text += groupNames.join('\n\n');

  conn.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
};

handler.command = ['listargrupos'];
module.exports = handler;