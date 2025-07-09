const axios = require("axios");
 
let cacheTikTok = {}; // ID del mensaje => { chatId, results, index, sender } let usosPorUsuarioTT = {}; // usuario => cantidad
 
const handler = async (msg, { conn, text }) => { const chatId = msg.key.remoteJid; const sender = msg.key.participant || msg.key.remoteJid;
 
if (!text) { return conn.sendMessage(chatId, { text: `🎯 *Búsqueda de Videos TikTok*
 
📌 *Usa el comando así:* .tiktoksearch 
 
💡 *Ejemplo:* .tiktoksearch humor negro
 
🔍 *KilluaBot buscará los mejores resultados para ti...*`, contextInfo: { forwardedNewsletterMessageInfo: { newsletterJid: "120363400979242290@newsletter", newsletterName: "𝗞𝗜𝗟𝗟𝗨𝗔-𝗕𝗢𝗧 👑", serverMessageId: "" }, forwardingScore: 9999999, isForwarded: true } }, { quoted: msg }); }
 
try { await conn.sendMessage(chatId, { react: { text: "🔍", key: msg.key, }, });
 `const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`); let results = response?.data;  if (!results || results.length === 0) {   return conn.sendMessage(chatId, {     text: "😔 *No se encontraron resultados para tu búsqueda.*"   }, { quoted: msg }); }  results.sort(() => Math.random() - 0.5); const topResults = results.slice(0, 4);  const { nowm, title, author, duration, likes } = topResults[0]; const fecha = new Date().toLocaleDateString("es-HN", {   year: "numeric", month: "2-digit", day: "2-digit" }); 

    const caption = 
`╭「 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝗱𝗼 」╮
│
│ 👤 *Autor:* ${author || 'Desconocido'}
│ ⏱️ *Duración:* ${duration || 'Desconocida'}
│ ❤️ *Likes:* ${likes || '0'}
╰────────────────╯

📥 *𝖵𝗂́𝖽𝖾𝗈 𝖽𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝖽𝗈 𝖼𝗈𝗇 𝖾́𝗑𝗂𝗍𝗈*
> *𝙍𝙚𝙖𝙘𝙘𝙞𝙤𝙣𝙖 𝙥𝙖𝙧𝙖 𝙫𝙚𝙧 𝙢á𝙨...*`;

    const sentMsg = await conn.sendMessage(chatId, {
      video: { url: nowm },
      caption,
      mimetype: "video/mp4"
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: sentMsg.key,
      },
    });

    // Guardamos el estado de este mensaje
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
      const newCaption = 
`╭「 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝗱𝗼 」╮
│
│ 👤 *Autor:* ${author || 'Desconocido'}
│ ⏱️ *Duración:* ${duration || 'Desconocida'}
│ ❤️ *Likes:* ${likes || '0'}
╰────────────────╯

📥 *𝙍𝙚𝙖𝙘𝙘𝙞𝙤𝙣𝙖 𝙥𝙖𝙧𝙖 𝙫𝙚𝙧 𝙤𝙩𝙧𝙤...*`;

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
      }, 5 * 60 * 1000); // 5 minutos
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