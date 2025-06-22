const handler = async (m, { conn, args }) => {
  const text = args.join(' ');
  const user = global.db.data.users[m.sender];
  user.afk = +new Date;
  user.afkReason = text;

  // Puedes usar conn.sendMessage en vez de fakeReply si no tienes fakeReply implementado
  await conn.sendMessage(m.chat, {
    text: `『 ＡＦＫ 』

> ᴇʟ ᴜsᴜᴀʀɪᴏ ${await conn.getName(m.sender)} ᴇsᴛᴀ ɪɴᴀᴄᴛɪᴠᴏ. 

\`💤 ＮＯ ＬＯＳ ＥＴＩＱＵＥＴＥ 💤\`
*☣️ ᴍᴏᴛɪᴠᴏs :* ${text ? ': ' + text : 'paja'}`
  }, { quoted: m });
};

handler.help = ['afk [motivo]'];
handler.tags = ['econ'];
handler.command = /^afk$/i;
handler.money = 95;
handler.register = true;
module.exports = handler;