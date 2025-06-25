// plugins/guia.js

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const textoGuia = `
╭───❖ 「 *GUÍA DE USO* 」 ❖───╮
│
├ 💬 Usa los comandos con el prefijo: *.*
│
├ 🛠️ *Comandos básicos:*
│   ├ .menu - Muestra el menú de comandos
│   ├ .estado - Estado del bot
│   ├ .ping - Velocidad de respuesta
│
├ 👥 *Comandos grupales:*
│   ├ .bienvenida on/off
│   ├ .grupo abrir / cerrar
│
├ 🎮 *Juegos:*
│   ├ .ppt piedra/papel/tijera
│   ├ .dado
│
├ 👑 *Solo admins:*
│   ├ .ban / .unban
│   ├ .add / .kick / .promote / .demote
│
├ 👤 *Extras:*
│   ├ .sticker
│   ├ .toimg
│
╰─────⌬ ᴷⁱˡˡᵘᵃᴮᵒᵗ ⌬─────╯
`

  // Reemplaza este enlace por el GIF que tú quieras
  const gifURL = "https://cdn.russellxz.click/b66b17c2.mp4";

  await conn.sendMessage(chatId, {
    video: { url: gifURL },
    caption: textoGuia,
    gifPlayback: true
  }, { quoted: msg });
};

handler.command = /^guia$/i
handler.tags = ["info"];
handler.help = [".guia"];
module.exports = handler;