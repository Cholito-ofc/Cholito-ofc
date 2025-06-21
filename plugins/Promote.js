const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Carga la info del grupo
  const groupMetadata = await conn.groupMetadata(chatId);
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'; // Corrige para Baileys MD

  // Verifica que el bot es admin
  const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!isBotAdmin) {
    return conn.sendMessage(chatId, { text: '❌ Debo ser admin para usar este comando.' }, { quoted: msg });
  }

  // Verifica que quien ejecuta el comando es admin
  const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
  const isSenderAdmin = groupMetadata.participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  if (!isSenderAdmin) {
    return conn.sendMessage(chatId, { text: '❌ Solo los admins pueden usar este comando.' }, { quoted: msg });
  }

  // Selección del usuario: mención o respuesta
  let user = null;
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    user = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }
  if (!user && msg.message?.extendedTextMessage?.contextInfo?.participant) {
    user = msg.message.extendedTextMessage.contextInfo.participant;
  }
  if (!user) {
    return conn.sendMessage(chatId, {
      text: '❌ Debes mencionar (@) o responder al mensaje del usuario que quieres hacer admin.'
    }, { quoted: msg });
  }

  // Verifica que el usuario está en el grupo
  const participante = groupMetadata.participants.find(p => p.id === user);
  if (!participante) {
    return conn.sendMessage(chatId, { text: '❌ El usuario no está en el grupo.' }, { quoted: msg });
  }
  if (participante.admin === 'admin' || participante.admin === 'superadmin') {
    return conn.sendMessage(chatId, { text: '⚠️ Ese usuario ya es admin.' }, { quoted: msg });
  }

  // Promueve a admin
  await conn.groupParticipantsUpdate(chatId, [user], 'promote');

  // Mensaje especial
  return conn.sendMessage(chatId, {
    text: `
╭━━〔 *¡NUEVO ADMIN!* 〕━━⬣
┃✨ Felicidades @${user.split('@')[0]}
┃🔰 Ahora eres *Administrador* del grupo.
┃⚠️ Usa tus poderes con sabiduría.
╰━━━━━━━━━━━━━━━━━━━━━━⬣
    `.trim(),
    mentions: [user]
  }, { quoted: msg });
};

handler.command = ["promote"];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;