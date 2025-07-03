const axios = require("axios");

let cachePack = {}; // ID mensaje => { chatId, sender }
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

    // Petición a la API para imagen pack
    const res = await axios.get("https://delirius-apiofc.vercel.app/nsfw/girls");
    const url = res.data?.url;

    if (!url || typeof url !== "string") {
      return await conn.sendMessage(chatId, {
        text: "❌ La API no devolvió una URL válida.",
      }, { quoted: msg });
    }

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url },
      caption: "🔥 Reacciona a esta imagen para ver otro pack.",
    }, { quoted: msg });

    // Reacción de "listo"
    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: sentMsg.key,
      },
    });

    cachePack[sentMsg.key.id] = {
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

      if (!cachePack[reactedMsgId]) return;
      if (user !== cachePack[reactedMsgId].sender) return;

      if ((usosPorUsuario[user] || 0) >= 3) {
        return await conn.sendMessage(cachePack[reactedMsgId].chatId, {
          text: `❌ Ya viste suficiente por ahora.\n🕒 Espera *5 minutos* para seguir viendo packs 🔥.`,
          mentions: [user],
        });
      }

      // Nueva petición para otra imagen
      const newRes = await axios.get("https://delirius-apiofc.vercel.app/nsfw/girls");
      const newUrl = newRes.data?.url;

      if (!newUrl || typeof newUrl !== "string") {
        return await conn.sendMessage(cachePack[reactedMsgId].chatId, {
          text: "❌ La API no devolvió una URL válida para la siguiente imagen.",
          mentions: [user],
        });
      }

      const newMsg = await conn.sendMessage(cachePack[reactedMsgId].chatId, {
        image: { url: newUrl },
        caption: "🔥 Otro pack... Reacciona de nuevo para más.",
      });

      await conn.sendMessage(cachePack[reactedMsgId].chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      cachePack[newMsg.key.id] = {
        chatId: cachePack[reactedMsgId].chatId,
        sender: user,
      };
      delete cachePack[reactedMsgId];

      usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;

      setTimeout(() => {
        usosPorUsuario[user] = 0;
      }, 5 * 60 * 1000); // 5 minutos
    });

  } catch (e) {
    console.error("❌ Error en .pack:", e);
    await conn.sendMessage(msg.key.remoteJid, {
      text: "❌ No se pudo obtener el pack.",
    }, { quoted: msg });
  }
};

handler.command = ["pack"];
handler.tags = ["nsfw"];
handler.help = ["pack"];
module.exports = handler;