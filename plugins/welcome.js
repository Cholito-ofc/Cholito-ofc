const { WelcomeLeave } = require('canvafy');
const fetch = require('node-fetch');
const fs = require("fs");

const handler = async (msg, { conn, participants, groupMetadata }) => {
  const m = msg;
  if (!m.messageStubType || !m.key.remoteJid.endsWith("@g.us")) return;

  const chatId = m.key.remoteJid;

  // Validar si welcome está activado en este grupo
  const path = "./activos.json";
  let activos = {};
  if (fs.existsSync(path)) {
    activos = JSON.parse(fs.readFileSync(path, "utf-8"));
  }
  if (!activos?.welcome?.[chatId]) return;

  const stubType = m.messageStubType;
  const userId = m.messageStubParameters?.[0] + "@s.whatsapp.net";

  const group = await conn.groupMetadata(chatId);
  const userName = await conn.getName(userId).catch(() => "Usuario");

  const getAvatar = async () => {
    try {
      return await conn.profilePictureUrl(userId, 'image');
    } catch {
      return 'https://iili.io/37F8TL7.jpg';
    }
  };

  const frasesBienvenida = [
    "¡Bienvenido al grupo!", "Nuevo miembro unido", "Esperamos que te guste este lugar"
  ];
  const frasesDespedida = [
    "Se fue del grupo", "Hasta la próxima", "Adiós, que te vaya bien"
  ];
  const fraseWel = frasesBienvenida[Math.floor(Math.random() * frasesBienvenida.length)];
  const fraseBye = frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)];

  const membersCount = group.participants.length;

  const generateImage = async (title, description, backgroundUrl) => {
    const avatar = await getAvatar();
    return await new WelcomeLeave()
      .setAvatar(avatar)
      .setBackground('image', backgroundUrl)
      .setTitle(title)
      .setDescription(description)
      .setBorder('#2a2e35')
      .setAvatarBorder('#2a2e35')
      .setOverlayOpacity(0.1)
      .build();
  };

  if (stubType === 27) {
    const img = await generateImage("¡BIENVENIDO!", `👤 ${userName} ahora somos ${membersCount}`, 'https://iili.io/35pqXEJ.md.jpg');
    await conn.sendMessage(chatId, {
      image: img,
      caption: `✨ *${fraseWel}*\n👤 @${userId.split('@')[0]}`,
      mentions: [userId]
    });
  }

  if (stubType === 28) {
    const img = await generateImage("¡ADIÓS!", `👤 ${userName} salió, quedamos ${membersCount}`, 'https://iili.io/35pBv8Q.md.jpg');
    await conn.sendMessage(chatId, {
      image: img,
      caption: `👋 *${fraseBye}*\n👤 @${userId.split('@')[0]}`,
      mentions: [userId]
    });
  }

  if (stubType === 32) {
    const img = await generateImage("¡EXPULSADO!", `👤 ${userName} fue eliminado, quedan ${membersCount}`, 'https://iili.io/35pBv8Q.md.jpg');
    await conn.sendMessage(chatId, {
      image: img,
      caption: `🗑️ *${fraseBye}*\n👤 @${userId.split('@')[0]}`,
      mentions: [userId]
    });
  }
};

module.exports = handler;