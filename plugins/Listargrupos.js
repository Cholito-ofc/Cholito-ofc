const handler = async (msg, { conn }) => {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '🚫 Solo el *owner* puede usar este comando.'
    }, { quoted: msg });
  }

  let groups = {};
  try {
    groups = await conn.groupFetchAllParticipating();
  } catch (e) {
    console.error('Error al obtener los grupos:', e);
    return conn.sendMessage(msg.key.remoteJid, {
      text: '❌ No se pudieron obtener los grupos.'
    }, { quoted: msg });
  }

  const groupIds = Object.keys(groups);

  if (groupIds.length === 0) {
    return conn.sendMessage(msg.key.remoteJid, {
      text: '🤖 El bot no está en ningún grupo.'
    }, { quoted: msg });
  }

  let text = '*📋 Lista de grupos en los que estoy:*\n\n';

  groupIds.forEach((id, index) => {
    const metadata = groups[id];
    const name = metadata.subject || 'Sin nombre';
    text += `${index + 1}. ${name}\nID: ${id}\n\n`;
  });

  conn.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
};

handler.command = ['listargrupos'];
module.exports = handler;