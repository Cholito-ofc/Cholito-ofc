const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');

  if (!isGroup) {
    return conn.sendMessage(chatId, { text: '❌ Este comando solo funciona en grupos.' }, { quoted: msg });
  }

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentionedJid) {
    return conn.sendMessage(chatId, { text: '🔖 Menciona a alguien para ejecutarlo.' }, { quoted: msg });
  }

  // Obtener metadata del grupo
  const metadata = await conn.groupMetadata(chatId);
  const participants = metadata.participants;

  // Verifica si tú eres admin
  const senderId = msg.key.participant || msg.key.remoteJid;
  const isSenderAdmin = participants.find(p => p.id === senderId)?.admin === 'admin' || participants.find(p => p.id === senderId)?.admin === 'superadmin';

  if (!isSenderAdmin) {
    return conn.sendMessage(chatId, { text: '⚠️ Solo los admins pueden usar este comando.' }, { quoted: msg });
  }

  // Verifica si el bot es admin
  const botJid = conn.user?.jid?.split(':')[0] + '@s.whatsapp.net';
  const isBotAdmin = participants.find(p => p.id === botJid)?.admin === 'admin' || participants.find(p => p.id === botJid)?.admin === 'superadmin';

  if (!isBotAdmin) {
    return conn.sendMessage(chatId, { text: '🚫 No soy admin. No puedo expulsar a nadie.' }, { quoted: msg });
  }

  // Confirmación
  await conn.sendMessage(chatId, {
    text: `☠️ *Auto-Kill activado...*\n\n📌 *@${mentionedJid.split('@')[0]} estás sentenciado.*\n⏳ Tienes *2 minutos* antes de ser eliminado...\n😈 Disfruta tus últimos segundos...`,
    mentions: [mentionedJid]
  }, { quoted: msg });

  // Esperar 2 minutos
  await new Promise(res => setTimeout(res, 2 * 60 * 1000));

  // Intentar expulsar
  try {
    await conn.groupParticipantsUpdate(chatId, [mentionedJid], 'remove');
    await conn.sendMessage(chatId, {
      text: `🪦 *@${mentionedJid.split('@')[0]} ha sido ejecutado con éxito.*`,
      mentions: [mentionedJid]
    });
  } catch (e) {
    await conn.sendMessage(chatId, {
      text: `❌ No pude eliminar a @${mentionedJid.split('@')[0]}.`,
      mentions: [mentionedJid]
    });
  }
};

handler.command = ['autokill', 'rouletteaban'];
handler.group = true;
handler.tags = ['group'];
handler.help = ['autokill @usuario', 'rouletteaban @usuario'];

module.exports = handler;