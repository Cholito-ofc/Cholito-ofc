const axios = require("axios");

let cachePornololi = {}; // ID mensaje => { chatId, sender }
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

    // Hacer petición a la API
    const res = await axios.get("https://delirius-apiofc.vercel.app/nsfw/girls");
    const url = res.data.url; // suponiendo que el JSON responde con { url: "..." }

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
      sender,
    };

    usosPorUsuario[sender] = usosPorUsuario[sender] || 0;

    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const user = m.key.participant || m.key.remoteJid;

      if (!cachePornololi[reactedMsgId]) return;
      if (user !== cachePornololi[reactedMsgId].sender) return;

      if ((usosPorUsuario[user] || 0) >= 3) {
        return await conn.sendMessage(cachePornololi[reactedMsgId].chatId, {
          text: `❌ Ya viste suficiente por ahora.\n🕒 Espera *5 minutos* para seguir viendo contenido 😏.`,
          mentions: [user],
        });
      }

      // Nueva petición para otra imagen
      const newRes = await axios.get("https://delirius-apiofc.vercel.app/nsfw/girls");
      const newUrl = newRes.data.url;

      const newMsg = await conn.sendMessage(cachePornololi[reactedMsgId].chatId, {
        image: { url: newUrl },
        caption: "🥵 Otra más... Reacciona de nuevo.",
      });

      await conn.sendMessage(cachePornololi[reactedMsgId].chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      cachePornololi[newMsg.key.id] = {
        chatId: cachePornololi[reactedMsgId].chatId,
        sender: user,
      };
      delete cachePornololi[reactedMsgId];

      usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;

      setTimeout(() => {
        usosPorUsuario[user] = 0;
      }, 5 * 60 * 1000); // 5 minutos
    });

  } catch (e) {
    console.error("❌ Error en .pornololi:", e);
    await msg.reply("❌ No se pudo obtener el contenido.");
  }
};

handler.command = ["pack"];
handler.tags = ["nsfw"];
handler.help = ["pornololi"];
module.exports = handler;