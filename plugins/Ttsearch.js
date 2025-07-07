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

      // Limpiar reacciones anteriores del mismo usuario
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

// Listener GLOBAL
let listenerActivo = false;
function registrarListener(conn) {
  if (listenerActivo) return;
  listenerActivo = true;

  conn.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m?.message?.reactionMessage) return;

    const reaction = m.message.reactionMessage;
    const reactedMsgId = reaction.key?.id;
    const user = m.key.participant || m.key.remoteJid;

    const session = cacheTikTokSearch[reactedMsgId];
    if (!session) return;
    if (session.sender !== user) return;

    const { chatId, results, index, timeout } = session;

    clearTimeout(timeout);
    delete cacheTikTokSearch[reactedMsgId];

    if (index >= results.length) {
      await conn.sendMessage(chatId, {
        text: "✅ *Ya no hay más resultados para esta búsqueda.*",
        mentions: [user]
      });
      return;
    }

    // Enviar siguiente video
    const { nowm, author, duration, likes } = results[index];

    const caption =
`╭「 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝗱𝗼 」╮
│
│ 👤 *Autor:* ${author || "Desconocido"}
│ ⏱️ *Duración:* ${duration || "Desconocida"}
│ ❤️ *Likes:* ${likes || "0"}
╰─────────────╯

📥 *𝖵𝗂́𝖽𝖾𝗈 𝖽𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝖽𝗈 𝖼𝗈𝗇 𝖾́𝗑𝗂𝗍𝗈*
> *𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 🎬*

🔁 *Reacciona a este video para ver el siguiente (${results.length - index - 1} restantes).*`;

    const sentMsg = await conn.sendMessage(chatId, {
      video: { url: nowm },
      caption,
      mimetype: "video/mp4"
    });

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: sentMsg.key },
    });

    const newTimeout = setTimeout(() => {
      delete cacheTikTokSearch[sentMsg.key.id];
    }, 2 * 60 * 1000);

    cacheTikTokSearch[sentMsg.key.id] = {
      chatId,
      sender: user,
      results,
      index: index + 1,
      timeout: newTimeout
    };
  });
}

handler.command = ["tiktoksearch", "tiktoks"];
handler.tags = ["buscador"];
handler.help = ["tiktoksearch <tema>"];
handler.register = true;

// Importante: registrar el listener cuando el bot inicia
handler.after = async (conn) => {
  registrarListener(conn);
};

module.exports = handler;