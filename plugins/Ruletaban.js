const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;

  // Verifica que sea un grupo
  if (!chatId.endsWith('@g.us')) {
    return conn.sendMessage(chatId, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
  }

  // Verifica que se mencione a alguien
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentionedJid) {
    return conn.sendMessage(chatId, { text: '🔖 Menciona a alguien para ejecutarlo.' }, { quoted: msg });
  }

  // Obtener participantes del grupo manualmente
  const metadata = await conn.groupMetadata(chatId);
  const participants = metadata.participants || [];

  const senderId = msg.key.participant || msg.key.remoteJid;
  const botId = conn.user?.id?.split(':')[0] + '@s.whatsapp.net'; // NORMALIZADO

  // Verificar si el remitente es admin
  const senderIsAdmin = participants.find(p => p.id === senderId)?.admin;
  if (!senderIsAdmin) {
    return conn.sendMessage(chatId, { text: '⚠️ Solo los admins pueden usar este comando.' }, { quoted: msg });
  }

  // Verificar si el bot es admin (esta era la parte que fallaba)
  const botIsAdmin = participants.find(p => p.id === botId)?.admin;
  if (!botIsAdmin) {
    return conn.sendMessage(chatId, { text: '🚫 No soy admin. No puedo expulsar a nadie.' }, { quoted: msg });
  }

  // Verificar que el mencionado esté en el grupo
  const targetInGroup = participants.find(p => p.id === mentionedJid);
  if (!targetInGroup) {
    return conn.sendMessage(chatId, { text: '👤 El usuario no está en este grupo.' }, { quoted: msg });
  }

  // Anuncio de cuenta regresiva
  await conn.sendMessage(chatId, {
    text: `☠️ *Auto-Kill activado...*\n\n📌 *@${mentionedJid.split('@')[0]} estás sentenciado.*\n⏳ Tienes *2 minutos* antes de ser eliminado...\n😈 Disfruta tus últimos segundos...`,
    mentions: [mentionedJid]
  }, { quoted: msg });

  // Espera 2 minutos
  await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000));

  // Intentar expulsar
  await conn.groupParticipantsUpdate(chatId, [mentionedJid], 'remove').catch(() => {
    return conn.sendMessage(chatId, {
      text: `❌ No pude eliminar a @${mentionedJid.split('@')[0]}.`,
      mentions: [mentionedJid]
    }, { quoted: msg });
  });

  // Mensaje final
  await conn.sendMessage(chatId, {
    text: `🪦 *@${mentionedJid.split('@')[0]} ha sido ejecutado con éxito.*`,
    mentions: [mentionedJid]
  });
};

handler.command = ['autokill', 'rouletteaban'];
handler.group = true;
handler.tags = ['group'];
handler.help = ['autokill @usuario', 'rouletteaban @usuario'];

module.exports = handler;