const fs = require('fs');
const path = require('path');

const WELCOME_PATH = path.resolve('./welcome-status.json');
if (!fs.existsSync(WELCOME_PATH)) fs.writeFileSync(WELCOME_PATH, '{}', 'utf-8');

let handler = async (event, { conn }) => {
  // Solo eventos de añadir/invitar en grupo
  if (!event.isGroup || !event.participants || !['add', 'invite'].includes(event.action)) return;

  // Lee el estado del welcome para este grupo
  const data = JSON.parse(fs.readFileSync(WELCOME_PATH, 'utf-8'));
  if (!data[event.id]) return; // Welcome apagado

  const chatId = event.id;
  const userId = event.participants[0];

  try {
    // Info del grupo
    const metadata = await conn.groupMetadata(chatId);
    const groupName = metadata.subject || "Grupo";
    const groupDesc = metadata.desc || "Sin descripción";

    // Foto de perfil del usuario (o default)
    let userProfilePic;
    try {
      userProfilePic = await conn.profilePictureUrl(userId, 'image');
    } catch {
      userProfilePic = 'https://telegra.ph/file/51d41b7a1e7e80194b1d8.png';
    }

    // Etiqueta al usuario
    const mentionJid = [userId];

    // Mensaje de bienvenida
    const text =
      `👋 ¡Bienvenido/a @${userId.split('@')[0]}!\n` +
      `*Grupo*: ${groupName}\n` +
      `*Descripción*: ${groupDesc}\n\n` +
      `🤖 *textbot*`;

    // Envía la foto de perfil con el mensaje
    await conn.sendMessage(chatId, {
      image: { url: userProfilePic },
      caption: text,
      mentions: mentionJid
    });

  } catch (e) {
    // Fallback si algo falla
    await conn.sendMessage(chatId, {
      text: `👋 ¡Bienvenido/a @${userId.split('@')[0]}!\n🤖 *textbot*`,
      mentions: [userId]
    });
  }
};

handler.event = "group-participants.update";
module.exports = handler;