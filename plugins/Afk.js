const handler = async (m, { conn, args }) => {
  const text = args.join(' ');
  const user = global.db.data.users[m.sender];
  user.afk = +new Date;
  user.afkReason = text;

  await conn.sendMessage(m.chat, {
    text:
      `╭─⬣「 *MODO AFK ACTIVADO* 」⬣\n` +
      `│ ≡◦ 👤 *Usuario:* @${m.sender.split('@')[0]}\n` +
      `│ ≡◦ 💤 *Motivo:* ${text ? text : 'No especificado'}\n` +
      `╰─⬣\n` +
      `Ahora si te mencionan, sabrán que estás inactivo.`,
    mentions: [m.sender]
  }, { quoted: m });
};
handler.help = ['afk [motivo]'];
handler.tags = ['herramientas'];
handler.command = /^afk$/i;
handler.register = true;
module.exports = handler;