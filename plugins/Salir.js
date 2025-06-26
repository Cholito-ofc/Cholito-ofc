const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  if (!global.owner.some(([id]) => id === senderNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo el *owner* del bot puede usar este comando."
    }, { quoted: msg });
  }

  const numero = args[0];
  if (!numero || isNaN(numero)) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Debes escribir el número del grupo.\nEjemplo: *.salirgrupo 2*'
    }, { quoted: msg });
  }

  const grupo = (global.gruposAdmin || []).find(g => g.code === numero);

  if (!grupo) {
    return conn.sendMessage(chatId, {
      text: '❌ No se encontró el grupo con ese número. Usa *.listarsalir* para ver los disponibles.'
    }, { quoted: msg });
  }

  try {
    await conn.sendMessage(grupo.id, {
      text: '👋 El bot ha sido retirado de este grupo por orden del owner.'
    });
    await conn.groupLeave(grupo.id);
    return conn.sendMessage(chatId, {
      text: `✅ Salí del grupo *${grupo.name}*.`
    }, { quoted: msg });
  } catch (e) {
    console.error(e);
    return conn.sendMessage(chatId, {
      text: '❌ No se pudo salir del grupo. ¿Soy admin?'
    }, { quoted: msg });
  }
};

handler.command = ['salirgrupo'];
module.exports = handler;