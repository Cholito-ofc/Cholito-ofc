const axios = require("axios");

const pendingTiktok = {}; // msgId => { chatId, sender, results, index, timeout }

module.exports = async (msg, { conn, text }) => {
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

  await conn.sendMessage(chatId, {
    react: { text: "🕒", key: msg.key }
  });

  try {
    const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    const results = response?.data;

    if (!results || results.length === 0) {
      return conn.sendMessage(chatId, {
        text: "😔 *No se encontraron resultados para tu búsqueda.*"
      }, { quoted: msg });
    }

    results.sort(() => Math.random() - 0.5);
    const top = results.slice(0, 5);

    const { nowm, author, duration, likes } = top[0];

    const caption =
`╭「 🎬 𝗧𝗶𝗸𝗧𝗼𝗸 𝗗𝗲𝘀𝗰𝗮𝗿𝗴𝗮𝗱𝗼 」╮
│
│ 👤 *Autor:* ${author || "Desconocido"}
│ ⏱️ *Duración:* ${duration || "Desconocida"}
│ ❤️ *Likes:* ${likes || "0"}
╰─────────────╯

📥 *𝖵𝗂́𝖽𝖾𝗈 𝖽𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝖽𝗈 𝖼𝗈𝗇 𝖾́𝗑𝗂𝗍𝗈*
> *𝙺𝙸𝙻𝙻𝚄𝙰 𝙱𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 🎬*

🔁 *Reacciona a este video para ver el siguiente (${top.length - 1} restantes).*`;

    const sent = await conn.sendMessage(chatId, {
      video: { url: nowm },
      caption,
      mimetype: "video/mp4"
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: sent.key }
    });

    const timeout = setTimeout(() => {
      delete pendingTiktok[sent.key.id];
    }, 2 * 60 * 1000);

    pendingTiktok[sent.key.id] = {
      chatId,
      sender,
      results: top,
      index: 1,
      timeout
    };

    // REGISTRAR LISTENER SOLO UNA VEZ
    if (!conn._tiktokListener) {
      conn._tiktokListener = true;

      conn.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m?.message?.reactionMessage) return;

        const { key, text: emoji } = m.message.reactionMessage;
        const session = pendingTiktok[key?.id];
        const user = m.key.participant || m.key.remoteJid;

        if (!session || user !== session.sender) return;

        const { chatId, results, index, timeout } = session;

        if (index >= results.length) {
          await conn.sendMessage(chatId, {
            text: "✅ *Ya no hay más videos para esta búsqueda.*",
            mentions: [user]
          });
          clearTimeout(timeout);
          delete pendingTiktok[key.id];
          return;
        }

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

        const sentNew = await conn.sendMessage(chatId, {
          video: { url: nowm },
          caption,
          mimetype: "video/mp4"
        });

        await conn.sendMessage(chatId, {
          react: { text: "✅", key: sentNew.key }
        });

        clearTimeout(timeout);
        delete pendingTiktok[key.id];

        const newTimeout = setTimeout(() => {
          delete pendingTiktok[sentNew.key.id];
        }, 2 * 60 * 1000);

        pendingTiktok[sentNew.key.id] = {
          chatId,
          sender: user,
          results,
          index: index + 1,
          timeout: newTimeout
        };
      });
    }

  } catch (err) {
    console.error(err);
    return conn.sendMessage(chatId, {
      text: "❌ *Error al obtener los videos:* " + err.message
    }, { quoted: msg });
  }
};

module.exports.command = ["ttsearch", "tiktoks"];
module.exports.tags = ["buscador"];
module.exports.help = ["tiktoksearch <tema>"];
module.exports.register = true;