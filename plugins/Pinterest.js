const axios = require('axios');

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.sender || msg.key.participant || msg.key.remoteJid;

  if (!text) {
    return conn.reply(chatId, `┏━━━『 *𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧 📌* 』━━━┓\n┆✦ Ingresa un texto para buscar.\n┗━━━━━━━━━━━━━━━━┛`, msg);
  }

  try {
    const res = await axios.get(`https://api.stellarwa.xyz/search/pinterest?query=${encodeURIComponent(text)}`);
    const json = res.data?.data;

    if (!json || !json.length) {
      return conn.reply(chatId, `┏━━━『 *𝙎𝙄𝙉 𝙍𝙀𝙎𝙐𝙇𝙏𝘼𝘿𝙊𝙎 ❌* 』━━━┓\n┆✦ No encontré resultados para: *${text}*\n┗━━━━━━━━━━━━━━━━━━┛`, msg);
    }

    const data = json[Math.floor(Math.random() * json.length)];
    const { id, created, hd, title } = data;

    const mensaje = `┏━━━━『 *𝙋𝙄𝙉 𝙀𝙉𝘾𝙊𝙉𝙏𝙍𝘼𝘿𝙊* 』━━━━┓
📌 *Título:* ${title || 'Sin título'}
👤 *Autor:* ${created || 'Desconocido'}
🔗 *Enlace:* https://pinterest.com/pin/${id}
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

    const fkontak = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Halo"
      },
      message: {
        contactMessage: {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Killua;Bot;;;\nFN:KilluaBot\nitem1.TEL;waid=${sender.split('@')[0]}:${sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
        }
      },
      participant: "0@s.whatsapp.net"
    };

    await conn.sendMessage(chatId, {
      image: { url: hd },
      caption: mensaje
    }, { quoted: fkontak });

  } catch (error) {
    console.error(error);
    return conn.reply(chatId, `┏━━━『 *𝙀𝙍𝙍𝙊𝙍 𝘼𝙇 𝘽𝙐𝙎𝘾𝘼𝙍* ⚠️ 』━━━┓\n┆✦ No se pudo completar la búsqueda.\n┗━━━━━━━━━━━━━━━━━━━━┛`, msg);
  }
};

handler.command = ['pinterest', 'pin', 'buscarpin'];
module.exports = handler;