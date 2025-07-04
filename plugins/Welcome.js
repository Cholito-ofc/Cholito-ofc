const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chatId = m.chat;
  const userId = m.messageStubParameters?.[0];

  if (!userId) return;

  // Leer archivo de funciones activas por grupo
  const activosPath = path.resolve('./activos.json');
  const activos = fs.existsSync(activosPath)
    ? JSON.parse(fs.readFileSync(activosPath))
    : {};

  const bienvenidaActiva = activos.bienvenida?.[chatId];
  if (!bienvenidaActiva) return;

  // Obtener imagen de perfil o usar default
  const pp = await conn.profilePictureUrl(userId, 'image').catch(_ => 'https://qu.ax/jYQH.jpg');
  const buffer = await (await fetch(pp)).buffer();
  const userTag = `@${userId.split('@')[0]}`;
  const groupName = groupMetadata.subject;
  const desc = groupMetadata.desc || 'sin descripción';
  const chat = global.db.data.chats[chatId] || {};

  // Mensaje de bienvenida (agregado)
  if (m.messageStubType === 27) {
    let text = chat.sWelcome
      ? chat.sWelcome
          .replace(/@user/g, userTag)
          .replace(/@group/g, groupName)
          .replace(/@desc/g, desc)
      : `┌─★ 𝑺𝑶𝑭𝑰 - 𝑩𝑶𝑻\n│「 Bienvenido 」\n└┬★ 「 ${userTag} 」\n   │✑  Bienvenido a\n   │✑  ${groupName}\n   │✑  Descripción:\n${desc}\n   └───────────────┈ ⳹`;

    await conn.sendMessage(chatId, {
      image: buffer,
      caption: text,
      mentions: [userId]
    });
  }

  // Mensaje de despedida (salió)
  if (m.messageStubType === 28) {
    let text = chat.sBye
      ? chat.sBye
          .replace(/@user/g, userTag)
          .replace(/@group/g, groupName)
          .replace(/@desc/g, desc)
      : `┌─★ 𝑺𝑶𝑭𝑰 - 𝑩𝑶𝑻\n│「 BAYY 👋 」\n└┬★ 「 ${userTag} 」\n   │✑  Lárgate\n   │✑  Jamás te quisimos aquí\n   └───────────────┈ ⳹`;

    await conn.sendMessage(chatId, {
      image: buffer,
      caption: text,
      mentions: [userId]
    });
  }

  // Mensaje cuando es expulsado
  if (m.messageStubType === 32) {
    let text = chat.sBye
      ? chat.sBye
          .replace(/@user/g, userTag)
          .replace(/@group/g, groupName)
          .replace(/@desc/g, desc)
      : `┌─★ 𝑺𝑶𝑭𝑰 - 𝑩𝑶𝑻\n│「 BAYY 👋 」\n└┬★ 「 ${userTag} 」\n   │✑  Fuiste expulsado\n   │✑  Mejor así 🙄\n   └───────────────┈ ⳹`;

    await conn.sendMessage(chatId, {
      image: buffer,
      caption: text,
      mentions: [userId]
    });
  }
}