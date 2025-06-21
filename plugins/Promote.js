const handler = async (msg, { sock, isBotAdmin, isAdmin, participants }) => {
  const chatId = msg.key.remoteJid;

  if (!isBotAdmin)
    return sock.sendMessage(chatId, { text: '❌ Debo ser admin para usar este comando.' }, { quoted: msg });
  if (!isAdmin)
    return sock.sendMessage(chatId, { text: '❌ Solo los admins pueden usar este comando.' }, { quoted: msg });

  // Selección del usuario a promover a admin
  let user = null;

  // Si hay menciones, toma la primera mención
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
    user = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }

  // Si no hay menciones pero es respuesta, toma el autor del mensaje respondido
  if (!user && msg.message?.extendedTextMessage?.contextInfo?.participant) {
    user = msg.message.extendedTextMessage.contextInfo.participant;
  }

  // Si no hay nada, muestra error
  if (!user) {
    return sock.sendMessage(chatId, { text: '❌ Debes mencionar (@) o responder al mensaje del usuario que quieres hacer admin.' }, { quoted: msg });
  }

  // Verifica que el usuario está en el grupo
  const participante = participants.find(p => p.id === user);
  if (!participante)
    return sock.sendMessage(chatId, { text: '❌ El usuario no está en el grupo.' }, { quoted: msg });

  // Si ya es admin, avisa
  if (participante.admin)
    return sock.sendMessage(chatId, { text: '⚠️ Ese usuario ya es admin.' }, { quoted: msg });

  // Promueve a admin
  await sock.groupParticipantsUpdate(chatId, [user], 'promote');

  // Mensaje de confirmación con diseño especial
  return sock.sendMessage(chatId, {
    text: `
╭━━〔 *¡NUEVO ADMINISTRADOR!* 〕━━⬣
┃✨ Felicidades @${user.split('@')[0]}
┃
┃🔰 Ahora eres *Administrador(a)* del grupo.
┃
┃⚠️ Usa tus poderes con sabiduría.
╰━━━━━━━━━━━━━━━━━━━━━━⬣
    `.trim(),
    mentions: [user]
  }, { quoted: msg });
};

handler.command = ['promote'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;