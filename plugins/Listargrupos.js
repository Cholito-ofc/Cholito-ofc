const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat];
  const text = m.text.toLowerCase();

  if (!chat.audios) return;

  const audios = {
    'tarado': 'https://qu.ax/CoOd.mp3',
    'teamo': 'https://cdn.russellxz.click/4a69e7be.mp3',
    'tka': 'https://qu.ax/jakw.mp3',
    'hey': 'https://qu.ax/AaBt.mp3',
    'freefire': 'https://qu.ax/Dwqp.mp3',
    'feriado': 'https://qu.ax/mFCT.mp3',
    'aguanta': 'https://qu.ax/Qmz.mp3',
    'niconico': 'https://qu.ax/YdVq.mp3',
    'buen dia grupo': 'https://qu.ax/GoKq.mp3',
    'calla fan de bts': 'https://qu.ax/oqNf.mp3',
    'cambiate a movistar': 'https://qu.ax/RxJC.mp3',
    'omg': 'https://qu.ax/PfuN.mp3',
  };

  const url = audios[text];
  if (!url) return;

  try {
    await conn.sendPresenceUpdate('recording', m.chat);
    await conn.sendFile(m.chat, url, `${text}.mp3`, null, m, true, { type: 'audioMessage' });
  } catch (err) {
    console.error(err);
    m.reply('❌ Ocurrió un error al enviar el audio.');
  }
};

handler.customPrefix = /^(tarado|teamo|tka|hey|freefire|feriado|aguanta|niconico|buen dia grupo|calla fan de bts|cambiate a movistar|omg)$/i;
handler.command = [];
handler.exp = 0;
handler.register = false;
module.exports = handler;