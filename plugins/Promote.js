const handler = async (msg, { conn, participants }) => {
  const chatId = msg.key.remoteJid;

  // 1. Verifica que el bot sea admin
  const groupMetadata = await conn.groupMetadata(chatId);
  const isBotAdmin = groupMetadata.participants.some(p => p.id === (await conn.user.id) && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!isBotAdmin) {
    return conn.sendMessage(chatId, {
      text: '❌ Debo ser admin para usar este comando.'
    }, { quoted: msg });
  }

  // 2. Verifica que el que ejecuta el comando sea admin
  const sender = msg.key.participant || msg.participant || msg.key.remoteJid;
  const isSenderAdmin = groupMetadata.participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  if (!isSenderAdmin) {
    return conn.sendMessage(chatId, {
      text: '❌ Solo los admins pueden usar este comando.'
    }, { quoted: msg });
  }

  // 3. Selecciona al usuario objetivo: por mención o por respuesta
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

  // 4. Verifica que el usuario esté en el grupo
  const participante = groupMetadata.participants.find(p => p.id === user);
  if (!participante) {
    return conn.sendMessage(chatId, {
      text: '❌ El usuario no está en el grupo.'
    }, { quoted: msg });
  }
  if (participante.admin === 'admin' || participante.admin === 'superadmin') {
    return conn.sendMessage(chatId, {
      text: '⚠️ Ese usuario ya es admin.'
    }, { quoted: msg });
  }

  // 5. Promueve a admin
  await conn.groupParticipantsUpdate(chatId, [user], 'promote');

  // 6. Mensaje de confirmación con diseño
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