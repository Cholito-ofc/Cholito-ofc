const handler = async (m, { conn }) => {
  // Validar que exista sender o key con participant o remoteJid
  const sender = m?.sender || m?.key?.participant || m?.key?.remoteJid || null;
  if (!sender) {
    // Si no hay sender, no hacemos nada para evitar error
    return;
  }

  const senderNumber = sender.split('@')[0];

  const img = 'https://i.ibb.co/4jft6vs/file.jpg';

  const texto = `┏━━━━━━━━━━━━━━━━━⬣
┃  *🗣️  M E N Ú - A U D I O S*
┗━━━━━━━━━━━━━━━━━⬣
*「 .on audios 」para activar*

1. _Takataka_  
2. _Tarado_  
... (resto del menú)
52. _Te amo_  

*╰▸ No es necesario usar prefijos 「 ./# 」*
`;

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Killua"
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Killua;;;\nFN:KilluaBot\nitem1.TEL;waid=${senderNumber}:${senderNumber}\nitem1.X-ABLabel:Usuario\nEND:VCARD`
      }
    }
  };

  await conn.sendFile(m.chat, img, 'menu.jpg', texto, m, null, fkontak);
};

handler.command = ['menu2', 'menuaudios'];
handler.tags = ['main', 'audios'];
handler.help = ['menuaudios'];

module.exports = handler;