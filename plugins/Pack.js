const axios = require("axios");

let cachePack = {}; // ID mensaje => { chatId, data }
let usosPorUsuario = {}; // usuario => cantidad

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const chat = global.db.data.chats[chatId] || {};
  if (!chat.modocaliente) {
    return await conn.sendMessage(chatId, {
      text: "🔞 El *modo caliente* está desactivado en este grupo.\nActívalo con: *.modocaliente on*",
    }, { quoted: msg });
  }

  try {
    // Reacción de "procesando"
    await conn.sendMessage(chatId, {
      react: {
        text: "🕒",
        key: msg.key,
      },
    });

    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/booty.json");
    const data = res.data;
    const url = data[Math.floor(Math.random() * data.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url },
      caption: "🔥 Reacciona a este mensaje para ver otro pack.",
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
      data,
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
          text: `❌ Ya viste suficiente por ahora.\n🕒 Espera *5 minutos* para seguir viendo contenido 🔥.`,
          mentions: [user],
        });
      }

      const { chatId, data } = cachePack[reactedMsgId];
      const newUrl = data[Math.floor(Math.random() * data.length)];

      const newMsg = await conn.sendMessage(chatId, {
        image: { url: newUrl },
        caption: "🔥 Otro pack más... Reacciona de nuevo.",
      });

      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      cachePack[newMsg.key.id] = {
        chatId,
        data,
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
    await conn.sendMessage(chatId, {
      text: "❌ No se pudo obtener el contenido.",
    }, { quoted: msg });
  }
};

handler.command = ["pack"];
handler.tags = ["nsfw"];
handler.help = ["pack"];
module.exports = handler;