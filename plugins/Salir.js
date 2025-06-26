const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, ""); // Ej: 50212345678
  const mentionJid = sender.endsWith('@s.whatsapp.net') ? sender : sender + '@s.whatsapp.net';

  if (!global.owner.some(([id]) => id === senderNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo el *owner* del bot puede usar este comando."
    }, { quoted: msg });
  }

  const numero = args[0];
  if (!numero || isNaN(numero)) {
    return conn.sendMessage(chatId, {
      text: '⚠️ Debes escribir el número del grupo.\n\nEjemplo: *.salirgrupo 2*'
    }, { quoted: msg });
  }

  const grupo = (global.gruposAdmin || []).find(g => g.code === numero);

  if (!grupo) {
    return conn.sendMessage(chatId, {
      text: '❌ No se encontró el grupo con ese número.\nUsa *.listarsalir* para ver los disponibles.'
    }, { quoted: msg });
  }

  try {
    const botName = conn.user.name || 'KilluaBot';

    const salidaTexto = `
╭━━〔 🚪 *${botName} se ha retirado del grupo* 〕━━⬣
┃
┃ ⚠️ *Motivo:* El owner principal solicitó la salida
┃ 🏷️ *Grupo:* ${grupo.name}
┃ 👤 *Solicitado por:* @${senderNum}
┃
┃ 🛑 ${botName} ha abandonado este grupo.
╰━━━━━━━━━━━━━━━━━━━━⬣`.trim();

    await conn.sendMessage(grupo.id, {
      text: salidaTexto,
      mentions: [mentionJid]
    });

    await conn.groupLeave(grupo.id);

    return conn.sendMessage(chatId, {
      text: `✅ ${botName} ha salido del grupo *${grupo.name}* por tu orden.`,
      mentions: [mentionJid]
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