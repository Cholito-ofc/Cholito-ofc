/* plugins/welcome.js  (o el nombre que prefieras) */

const fs = require('fs');
const path = require('path');
const canvafy = require('canvafy');

/**
 * Se dispara antes de procesar cada mensaje.
 * @param {Object} m – mensaje recibido
 * @param {Object} helpers – helpers de la framework
 */
async function before (m, { conn, participants, groupMetadata }) {
  const chatId  = m.chat;
  const isGroup = chatId.endsWith('@g.us');
  if (!m.messageStubType || !isGroup) return;            // no es un evento de sistema o no es grupo

  /* ───── Comprobamos si la bienvenida/despedida está activa ───── */
  const activosPath = path.resolve('./activos.json');
  let activos = {};
  if (fs.existsSync(activosPath)) {
    try {
      activos = JSON.parse(fs.readFileSync(activosPath, 'utf-8'));
    } catch (e) {
      console.error('[WELCOME] activos.json corrupto:', e);
    }
  }
  if (!activos.welcome || !activos.welcome[chatId]) return;

  /* ───── Datos del usuario ───── */
  const who      = m.messageStubParameters[0] + '@s.whatsapp.net';
  const userName = (global.db?.data?.users?.[who]?.name) || await conn.getName(who);

  const getUserAvatar = async () => {
    try   { return await conn.profilePictureUrl(who, 'image'); }
    catch { return 'https://i.ibb.co/cFzgdNw/file.jpg'; }
  };

  const generateImage = async (title, description, bg) => {
    const avatar = await getUserAvatar();
    return new canvafy.WelcomeLeave()
      .setAvatar(avatar)
      .setBackground('image', bg)
      .setTitle(title)
      .setDescription(description)
      .setBorder('#2a2e35')
      .setAvatarBorder('#2a2e35')
      .setOverlayOpacity(0.1)
      .build();
  };

  /* ───── Texto e imagen dinámicos ───── */
  const groupName = groupMetadata.subject.trim();
  const groupSize = participants.length +
    (m.messageStubType === 27 ? 1 : (m.messageStubType === 28 || m.messageStubType === 32 ? -1 : 0));

  const userTag     = '@' + who.split('@')[0];
  const userMention = [who];

  if (m.messageStubType === 27) {          // ──── Bienvenida ────
    const caption = `❀ *Se unió* al grupo *${groupName}* ✰ ${userTag}

Ꮚ˘ ꈊ ˘Ꮚ ¡Bienvenido/a, ${userName}! Que tengas un excelente día ✨

🧠 Usa *#menu* si necesitas ayuda.
💬 Disfruta del grupo.`;

    const img = await generateImage(
      '¡BIENVENID@!',
      `Ahora somos ${groupSize} miembros.`,
      'https://i.ibb.co/1fVJfvxk/file.jpg'
    );

    await conn.sendMessage(chatId, { image: img, caption, mentions: userMention });

  } else if (m.messageStubType === 28 || m.messageStubType === 32) {   // ──── Despedida ────
    const caption = `❀ *Salió del grupo* *${groupName}* ✰ ${userTag}

Ꮚ˘ ꈊ ˘Ꮚ ¡Nos vemos pronto! Cuídate mucho ✨

🚪 Ha dejado el grupo.`;

    const img = await generateImage(
      '¡HASTA PRONTO!',
      `Ahora somos ${groupSize} miembros.`,
      'https://i.ibb.co/Kcf0xdrQ/file.jpg'
    );

    await conn.sendMessage(chatId, { image: img, caption, mentions: userMention });
  }
}

/* Exportación estilo CommonJS (lo que tu bot espera) */
module.exports = { before };