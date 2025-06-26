const handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '🚫 Solo el *owner* puede usar este comando.'
    }, { quoted: msg });
  }

  const allChats = conn.chats || {};
  const groupChats = Object.entries(allChats).filter(([id, data]) => id.endsWith('@g.us'));

  if (groupChats.length === 0) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '🤖 El bot no está en ningún grupo.'
    }, { quoted: msg });
  }

  let text = '*📋 Lista de grupos en los que estoy:*\n\n';

  for (let i = 0; i < groupChats.length; i++) {
    const [id] = groupChats[i];
    let name = id;
    try {
      const metadata = await conn.groupMetadata(id);
      name = metadata.subject || name;
    } catch (e) {
      name = '(Nombre no disponible)';
    }
    text += `${i + 1}. ${name}\nID: ${id}\n\n`;
  }

  conn.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
};

handler.command = ['listargrupos'];
module.exports = handler;