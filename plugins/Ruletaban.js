const handler = async (msg, { conn, args, participants, isBotAdmin, isAdmin, command }) => {
  const chatId = msg.key.remoteJid;

  if (!chatId.endsWith('@g.us')) {
    return conn.sendMessage(chatId, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
  }

  if (!isAdmin) return conn.sendMessage(chatId, { text: '⚠️ Solo los admins pueden usar este comando.' }, { quoted: msg });
  if (!isBotAdmin) return conn.sendMessage(chatId, { text: '🚫 No soy admin. No puedo expulsar a nadie.' }, { quoted: msg });

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentionedJid) return conn.sendMessage(chatId, { text: '🔖 Menciona a alguien para ejecutarlo.' }, { quoted: msg });

  if (!participants.some(p => p.id === mentionedJid)) {
    return conn.sendMessage(chatId, { text: '👤 El usuario no está en este grupo.' }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    text: `☠️ *${command === 'autokill' ? 'Auto-Kill' : 'Roulette-A-Ban'} activado...*\n\n📌 *@${mentionedJid.split('@')[0]} estás sentenciado.*\n⏳ Tienes *2 minutos* antes de ser eliminado...\n😈 Prepárate para la muerte.`,
    mentions: [mentionedJid]
  }, { quoted: msg });

  // Espera 2 minutos
  await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));

  await conn.groupParticipantsUpdate(chatId, [mentionedJid], 'remove').catch(() => {
    return conn.sendMessage(chatId, { text: `❌ No pude eliminar a @${mentionedJid.split('@')[0]}.`, mentions: [mentionedJid] }, { quoted: msg });
  });
};

handler.command = ['autokill', 'rouletteaban'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
handler.tags = ['group'];
handler.help = ['autokill @usuario', 'rouletteaban @usuario'];

module.exports = handler;