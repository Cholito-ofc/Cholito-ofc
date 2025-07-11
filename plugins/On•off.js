const handler = async (m, { args, command, usedPrefix }) => {
  const chatId = m.chat;

  if (!global.db) global.db = {};
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.chats) global.db.data.chats = {};
  if (!global.db.data.chats[chatId]) global.db.data.chats[chatId] = {};

  const subcmd = args[0]?.toLowerCase();
  const chat = global.db.data.chats[chatId];

  switch (subcmd) {
    case "audios":
      chat.audios = command === "on";
      await m.reply(`🎧 *Audios sin prefijo ${command === "on" ? "activados" : "desactivados"}.*`);
      break;

    default:
      await m.reply(`❌ *Uso incorrecto:*\n\n🟢 *Activar:* \`${usedPrefix}on audios\`\n🔴 *Desactivar:* \`${usedPrefix}off audios\``);
  }
};

handler.command = /^(on|off)$/i;
handler.admin = true; // Solo admins pueden activar/desactivar
handler.group = true; // Solo en grupos

export default handler;