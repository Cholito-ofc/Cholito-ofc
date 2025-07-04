const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = {
  name: ['bienvenida'],
  alias: [],
  tags: ['group'],
  command: ['bienvenida'],
  group: true,
  admin: true,
  botAdmin: false,

  run: async (msg, { conn, args, participants, groupMetadata }) => {
    const chatId = msg.chat;

    // Leer activos.json
    const activosPath = path.resolve('./activos.json');
    const activos = fs.existsSync(activosPath)
      ? JSON.parse(fs.readFileSync(activosPath))
      : {};

    const bienvenidaActiva = activos.bienvenida?.[chatId];
    if (!bienvenidaActiva) {
      return await conn.sendMessage(chatId, {
        text: '❌ La bienvenida está desactivada. Usa *.enable bienvenida* para activarla.'
      }, { quoted: msg });
    }

    // Elegir usuario simulado (quien ejecutó el comando)
    const userId = msg.participant || msg.key.participant || msg.key.remoteJid;
    const userTag = `@${userId.split('@')[0]}`;
    const groupName = groupMetadata.subject;
    const desc = groupMetadata.desc || 'sin descripción';
    const chat = global.db.data.chats[chatId] || {};

    // Obtener imagen del usuario
    const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://qu.ax/jYQH.jpg');
    const buffer = await (await fetch(pp)).buffer();

    // Construir mensaje
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
    }, { quoted: msg });
  }
};