const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
    }, { quoted: msg });
  }

  const meta = await conn.groupMetadata(chatId);
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin;
  const isFromMe = msg.key.fromMe;

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo *admins* o *el dueño del bot* pueden usar este comando."
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    text: "👋 El bot se retirará del grupo..."
  }, { quoted: msg });

  try {
    await conn.groupLeave(chatId);
  } catch (e) {
    console.error("Error al salir del grupo:", e);
    await conn.sendMessage(chatId, {
      text: "❌ No se pudo salir del grupo. ¿El bot es admin?"
    }, { quoted: msg });
  }
};

handler.command = ['salirgrupo'];
module.exports = handler;