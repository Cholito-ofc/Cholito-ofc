const fs = require("fs"); const path = require("path"); const canvafy = require("canvafy");

export async function before(m, { conn, participants, groupMetadata }) { const chatId = m.chat; const isGroup = chatId.endsWith("@g.us"); if (!m.messageStubType || !isGroup) return;

// Leer configuración welcome desde activos.json const activosPath = path.resolve("./activos.json"); let activos = {}; if (fs.existsSync(activosPath)) { activos = JSON.parse(fs.readFileSync(activosPath, "utf-8")); } if (!activos.welcome || !activos.welcome[chatId]) return;

const who = m.messageStubParameters[0] + '@s.whatsapp.net'; const userName = (global.db.data.users[who]?.name) || await conn.getName(who);

const getUserAvatar = async () => { try { return await conn.profilePictureUrl(who, 'image'); } catch (err) { return 'https://i.ibb.co/cFzgdNw/file.jpg'; } };

const generateImage = async (title, description, backgroundImage) => { const userAvatar = await getUserAvatar(); const img = await new canvafy.WelcomeLeave() .setAvatar(userAvatar) .setBackground('image', backgroundImage) .setTitle(title) .setDescription(description) .setBorder('#2a2e35') .setAvatarBorder('#2a2e35') .setOverlayOpacity(0.1) .build(); return img; };

const groupName = groupMetadata.subject.trim(); const groupSize = participants.length + (m.messageStubType === 27 ? 1 : (m.messageStubType === 28 || m.messageStubType === 32 ? -1 : 0)); const grupoLink = 'https://chat.whatsapp.com/'; // Puedes personalizarlo si quieres

const userTag = @${who.split('@')[0]}; const userMention = [who];

if (m.messageStubType === 27) { // BIENVENIDA const bienvenida = `❀ Se unió al grupo ${groupName} ✰ ${userTag}

Ꮚ⁠˘⁠ ⁠ꈊ⁠ ⁠˘⁠ ⁠Ꮚ ¡Bienvenido/a! Que tengas un excelente día ✨

> 🧠 Usa #menu si necesitas ayuda. 💬 Disfruta del grupo.`;



const img = await generateImage('¡BIENVENIDO/A!', `Ahora somos ${groupSize} miembros.`, 'https://i.ibb.co/1fVJfvxk/file.jpg');
await conn.sendMessage(chatId, {
  image: img,
  caption: bienvenida,
  mentions: userMention
});

} else if (m.messageStubType === 28 || m.messageStubType === 32) { // DESPEDIDA const despedida = `❀ Salió del grupo ${groupName} ✰ ${userTag}

Ꮚ⁠˘⁠ ⁠ꈊ⁠ ⁠˘⁠ ⁠Ꮚ ¡Nos vemos pronto! Cuídate mucho ✨

> 🚪 Ha dejado el grupo.`;



const img = await generateImage('¡HASTA PRONTO!', `Ahora somos ${groupSize} miembros.`, 'https://i.ibb.co/Kcf0xdrQ/file.jpg');
await conn.sendMessage(chatId, {
  image: img,
  caption: despedida,
  mentions: userMention
});

} }

