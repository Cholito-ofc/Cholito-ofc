const axios = require("axios");
const fetch = require("node-fetch");

let cacheTikTok = {};
let usosPorUsuarioTT = {};

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");

  // vCard decorativo (igual al del modo apagado)
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "ᴛɪᴋᴛᴏᴋ sᴇᴀʀᴄʜ",
        jpegThumbnail: await (await fetch('https://iili.io/F1Wvr8J.th.png')).buffer(),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Unlimited;;;\n" +
          "FN:Unlimited\n" +
          "ORG:Unlimited\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Unlimited\n" +
          "X-WA-BIZ-DESCRIPTION:ofc\n" +
          "X-WA-BIZ-NAME:Unlimited\n" +
          "END:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  };

  if (!text) {
    return conn.sendMessage(chatId, {
      text:
`\`𝖴𝖲𝖮 𝖨𝖭𝖢𝖮𝖱𝖱𝖤𝖢𝖳𝖮 ❌\`
> 𝖯𝗋𝗂𝗆𝖾𝗋𝗈 𝖾𝗌𝖼𝗋𝗂𝖻𝖾 𝖾𝗅 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗒 𝗅𝗎𝖾𝗀𝗈 𝖽𝖾𝗅 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗅𝖺 𝖻𝗎́𝗌𝗊𝗎𝖾𝖽𝖺 𝗊𝗎𝖾 𝗊𝗎𝗂𝖾𝗋𝖾𝗌 𝗁𝖺𝖼𝖾𝗋. 

📌 *𝖤𝗌𝖼𝗋𝗂𝖻𝖾:* .𝗍𝗍𝗌𝖾𝖺𝗋𝖼𝗁 <𝗍𝖾𝗆𝖺>
📌 *𝖤𝗃𝖾𝗆𝗉𝗅𝗈:*.𝗍𝗍𝗌𝖾𝖺𝗋𝖼𝗁 𝖤𝖽𝗂𝗍𝗌 𝖢𝖱𝟩`,
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363400979242290@newsletter",
          newsletterName: "𝗞𝗜𝗟𝗟𝗨𝗔-𝗕𝗢𝗧 👑",
          serverMessageId: ""
        },
        forwardingScore: 9999999,
        isForwarded: true
      }
    }, { quoted: fkontak });
  }

  try {
    await conn.sendMessage(chatId, {
      react: {
        text: "🔍",
        key: msg.key,
      },
    });

    const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    let results = response?.data;

    if (!results || results.length === 0) {
      return conn.sendMessage(chatId, {
        text: "😔 *No se encontraron resultados para tu búsqueda.*"
      }, { quoted: msg });
    }

    results.sort(() => Math.random() - 0.5);
    const topResults = results.slice(0, 4);

    const { nowm, author, duration, likes } = topResults[0];
    const fecha = new Date().toLocaleDateString("es-HN", {
      year: "numeric", month: "2-digit", day: "2-digit"
    });

    const caption =
`*┏━〔 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝗱𝗼 〕━┓*
*┃» 👤𝖠𝗎𝗍𝗈𝗋:* ${author || "Desconocido"}
*┃» 📆𝖯𝗎𝖻𝗅𝗂𝖼𝖺𝖽𝗈:* ${fecha}
*┃» ⏰𝖣𝗎𝗋𝖺𝖼𝗂𝗈́𝗇:* ${duration || "Desconocida"}
*┃» ❤️ 𝖫𝗂𝗄𝖾𝗌:* ${likes || "0"}
*┗━━━━━━━━━━━━━━━━━┛*

> *𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 🎬*
> 𝖱𝖾𝖺𝖼𝖼𝗂𝗈𝗇𝖺 𝖼𝗈𝗇 𝗎𝗇 𝖾𝗆𝗈𝗃𝗂 𝗉𝖺𝗋𝖺 𝖾𝗅 𝗌𝗂𝗀𝗎𝗂𝖾𝗇𝗍𝖾 𝗏𝗂́𝖽𝖾𝗈 🌿`;

    const sentMsg = await conn.sendMessage(chatId, {
      video: { url: nowm },
      caption,
      mimetype: "video/mp4"
    }, { quoted: msg }); // Sin canal aquí

    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: sentMsg.key,
      },
    });

    cacheTikTok[sentMsg.key.id] = {
      chatId,
      results: topResults,
      index: 1,
      sender,
    };

    usosPorUsuarioTT[sender] = usosPorUsuarioTT[sender] || 0;

    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const user = m.key.participant || m.key.remoteJid;

      if (!cacheTikTok[reactedMsgId]) return;
      if (user !== cacheTikTok[reactedMsgId].sender) return;

      if ((usosPorUsuarioTT[user] || 0) >= 3) {
        return await conn.sendMessage(chatId, {
          text: `🚫 Ya viste suficientes *TikToks* por ahora.\n🕒 Espera *5 minutos* para continuar.`,
          mentions: [user],
        });
      }

      const state = cacheTikTok[reactedMsgId];
      const { results, index } = state;

      if (index >= results.length) {
        return await conn.sendMessage(chatId, {
          text: "✅ Ya viste todos los resultados disponibles.",
        });
      }

      const { nowm, author, duration, likes } = results[index];
      const fecha = new Date().toLocaleDateString("es-HN", {
        year: "numeric", month: "2-digit", day: "2-digit"
      });

      const newCaption =
`*┏━〔 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗀𝗮𝗱𝗼 〕━┓*
*┃» 👤𝖠𝗎𝗍𝗈𝗋:* ${author || "Desconocido"}
*┃» 📆𝖯𝗎𝖻𝗅𝗂𝖼𝖺𝖽𝗈:* ${fecha}
*┃» ⏰𝖣𝗎𝗋𝖺𝖼𝗂𝗈́𝗇:* ${duration || "Desconocida"}
*┃» ❤️ 𝖫𝗂𝗄𝖾𝗌:* ${likes || "0"}
*┗━━━━━━━━━━━━━━━━━┛*

> *𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 🎬*
> 𝖱𝖾𝖺𝖼𝖼𝗂𝗈𝗇𝖺 𝖼𝗈𝗇 𝗎𝗇 𝖾𝗆𝗈𝗃𝗂 𝗉𝖺𝗋𝖺 𝗏𝖾𝗋 𝗈𝗍𝗋𝗈 𝗏𝗂́𝖽𝖾𝗈 🌿`;

      const newMsg = await conn.sendMessage(chatId, {
        video: { url: nowm },
        caption: newCaption,
        mimetype: "video/mp4"
      });

      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      cacheTikTok[newMsg.key.id] = {
        chatId,
        results,
        index: index + 1,
        sender: user,
      };

      delete cacheTikTok[reactedMsgId];

      usosPorUsuarioTT[user] = (usosPorUsuarioTT[user] || 0) + 1;

      setTimeout(() => {
        usosPorUsuarioTT[user] = 0;
      }, 5 * 60 * 1000);
    });

  } catch (err) {
    console.error(err);
    return conn.sendMessage(chatId, {
      text: "❌ *Error al buscar o enviar los videos:*\n" + err.message
    }, { quoted: msg });
  }
};

handler.command = ["ttsearch", "tiktoks", "tiktoksearch"];
handler.tags = ["buscador"];
handler.help = ["tiktoksearch <tema>"];
handler.register = true;

module.exports = handler;