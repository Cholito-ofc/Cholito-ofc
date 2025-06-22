const handler = async (m, { conn, args }) => {
  console.log('AFK command received', m.sender, args); // <-- LOG PARA DEPURACIÓN
  const text = args.join(' ');
  const user = global.db.data.users[m.sender];
  if (!user) {
    console.error('User not found in database:', m.sender);
    return conn.sendMessage(m.chat, { text: 'Error interno: usuario no detectado en la base de datos.' }, { quoted: m });
  }
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