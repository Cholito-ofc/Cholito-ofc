const axios = require("axios");

let cachePornololi = {}; // ID mensaje => { chatId, data, usos }
let usosPorUsuario = {}; // usuario => cantidad

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  try {
    // Reacción de "procesando"
    await conn.sendMessage(chatId, {
      react: {
        text: "🕒",
        key: msg.key,
      },
    });

    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json");
    const data = res.data;
    const url = data[Math.floor(Math.random() * data.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url },
      caption: "🥵 Reacciona a este mensaje para ver otra imagen.",
    }, { quoted: msg });

    // Reacción de "listo"
    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: sentMsg.key,
      },
    });

    cachePornololi[sentMsg.key.id] = {
      chatId,
      data,
    };

    // Inicializar contador del usuario si no existe
    usosPorUsuario[sender] = 0;

    // Escuchar reacciones como en .vs4
    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const user = m.key.participant || m.key.remoteJid;
      const chatId = reaction.key?.remoteJid;

      if (!cachePornololi[reactedMsgId]) return;

      // Si ya superó el límite
      if ((usosPorUsuario[user] || 0) >= 5) {
        return await conn.sendMessage(chatId, {
          text: `❌ Ya viste mucho contenido. Espera un rato antes de seguir disfrutando, degenerado 😏.`,
          mentions: [user],
        });
      }

      const { data } = cachePornololi[reactedMsgId];
      const newUrl = data[Math.floor(Math.random() * data.length)];

      const newMsg = await conn.sendMessage(chatId, {
        image: { url: newUrl },
        caption: "🥵 Otra más... Reacciona de nuevo para seguir viendo.",
      });

      // Reacción ✅ en la nueva imagen
      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      // Actualizar cache
      cachePornololi[newMsg.key.id] = {
        chatId,
        data,
      };

      delete cachePornololi[reactedMsgId];

      // Sumar reacción del usuario
      usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;

      // Opción: resetear después de X minutos (5 mins)
      setTimeout(() => {
        usosPorUsuario[user] = 0;
      }, 5 * 60 * 1000); // 5 minutos
    });

  } catch (e) {
    console.error("❌ Error en .pornololi:", e);
    await msg.reply("❌ No se pudo obtener el contenido.");
  }
};

handler.command = ["pornololi"];
handler.tags = ["nsfw"];
handler.help = ["pornololi"];
module.exports = handler;