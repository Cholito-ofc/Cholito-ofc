const axios = require("axios");

let cachePornololi = {}; // ID mensaje => { chatId, data }
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

    // Guardar imagen enviada
    cachePornololi[sentMsg.key.id] = {
      chatId,
      data,
      sender, // quien podrá reaccionar
    };

    // Inicializar contador si no existe
    usosPorUsuario[sender] = usosPorUsuario[sender] || 0;

    // ESCUCHAR SOLO UNA VEZ (como en .vs4)
    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const user = m.key.participant || m.key.remoteJid;

      if (!cachePornololi[reactedMsgId]) return;
      if (user !== cachePornololi[reactedMsgId].sender) return; // Solo el mismo usuario puede seguir

      if ((usosPorUsuario[user] || 0) >= 5) {
        return await conn.sendMessage(cachePornololi[reactedMsgId].chatId, {
          text: `❌ Ya viste mucho contenido. Espera un rato para seguir disfrutando 😏.`,
          mentions: [user],
        });
      }

      const { chatId, data } = cachePornololi[reactedMsgId];
      const newUrl = data[Math.floor(Math.random() * data.length)];

      const newMsg = await conn.sendMessage(chatId, {
        image: { url: newUrl },
        caption: "🥵 Otra más... Reacciona de nuevo.",
      });

      // Reacción de "listo"
      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      // Actualizar nuevo mensaje
      cachePornololi[newMsg.key.id] = {
        chatId,
        data,
        sender: user
      };
      delete cachePornololi[reactedMsgId];

      // Aumentar contador
      usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;

      // Reset después de 5 minutos
      setTimeout(() => {
        usosPorUsuario[user] = 0;
      }, 5 * 60 * 1000);
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