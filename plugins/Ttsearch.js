const axios = require("axios");

const cacheTikTokSearch = {}; // msgID => { chatId, sender, results, index, timeout }

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(chatId, {
      text:
`🎯 *Búsqueda de Videos TikTok*

📌 *Usa el comando así:*
.tiktoksearch <tema>

💡 *Ejemplo:*
.tiktoksearch humor negro

🔍 *KilluaBot buscará los mejores resultados para ti...*`
    }, { quoted: msg });
  }

  try {
    await conn.sendMessage(chatId, {
      react: { text: "🕒", key: msg.key },
    });

    const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    const results = response?.data;

    if (!results || results.length === 0) {
      return conn.sendMessage(chatId, {
        text: "😔 *No se encontraron resultados para tu búsqueda.*"
      }, { quoted: msg });
    }

    results.sort(() => Math.random() - 0.5);
    const topResults = results.slice(0, 5);

    const sendVideo = async (index) => {
      const { nowm, author, duration, likes } = topResults[index];

      const caption =
`╭「 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝗱𝗼 」╮
│
│ 👤 *Autor:* ${author || "Desconocido"}
│ ⏱️ *Duración:* ${duration || "Desconocida"}
│ ❤️ *Likes:* ${likes || "0"}
╰─────────────╯

📥 *𝖵𝗂́𝖽𝖾𝗈 𝖽𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝖽𝗈 𝖼𝗈𝗇 𝖾́𝗑𝗂𝗍𝗈*
> *𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 🎬*

🔁 *Reacciona a este video para ver el siguiente (${topResults.length - index - 1} restantes).*`;

      const sentMsg = await conn.sendMessage(chatId, {
        video: { url: nowm },
        caption,
        mimetype: "video/mp4"
      }, { quoted: msg });

      await conn.sendMessage(chatId, {
        react: { text: "✅", key: sentMsg.key },
      });

      // Limpiar entradas anteriores
      for (let id in cacheTikTokSearch) {
        if (cacheTikTokSearch[id].sender === sender) {
          clearTimeout(cacheTikTokSearch[id].timeout);
          delete cacheTikTokSearch[id];
        }
      }

      const timeout = setTimeout(() => {
        delete cacheTikTokSearch[sentMsg.key.id];
      }, 2 * 60 * 1000); // 2 minutos

      cacheTikTokSearch[sentMsg.key.id] = {
        chatId,
        sender,
        results: topResults,
        index: index + 1,
        timeout,
      };
    };

    await sendVideo(0);

  } catch (err) {
    console.error(err);
    return conn.sendMessage(chatId, {
      text: "❌ *Error al buscar o enviar los videos:*\n" + err.message
    }, { quoted: msg });
  }
};

// Listener GLOBAL (una sola vez)
let listenerActivo = false;
function registrarListener(conn) {
  if (listenerActivo) return; // solo una vez
  listenerActivo = true;

  conn.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message?.reactionMessage) return;

    const reaction = m.message.reactionMessage;
    const reactedMsgId = reaction.key?.id;
    const user = m.key.participant || m.key.remoteJid;

    if (!cacheTikTokSearch[reactedMsgId]) return;
    if (user !== cacheTikTokSearch[reactedMsgId].sender) return;

    const { chatId, results, index, timeout } = cacheTikTokSearch[reactedMsgId];

    clearTimeout(timeout);
    delete cacheTikTokSearch[reactedMsgId];

    if (index >= results.length) {
      await conn.sendMessage(chatId, {
        text: "✅ *Ya no hay más resultados para esta búsqueda.*",
        mentions: [user]
      });
      return;
    }

    // Llamamos al handler original para enviar siguiente video
    const fakeMsg = {
      key: { remoteJid: chatId, participant: user },
      message: {},
    };
    handler(fakeMsg, { conn, text: results[index].title || "TikTok" });
  });
}

handler.command = ["ttsearch", "tiktoks"];
handler.tags = ["buscador"];
handler.help = ["tiktoksearch <tema>"];
handler.register = true;

handler.after = async (conn) => {
  registrarListener(conn);
};

module.exports = handler;