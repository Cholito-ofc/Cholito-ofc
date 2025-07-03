const packUrls = [
  "https://cdn.russellxz.click/30302e59.jpeg",
  "https://cdn.russellxz.click/5b056ca3.jpeg",
  "https://cdn.russellxz.click/56b2e2b4.jpeg",
  "https://cdn.russellxz.click/556fa4bc.jpeg",
];

let cachePack = {};
let usosPackUsuario = {};
let listenerRegistrado = false;

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const chat = global.db.data.chats[chatId] || {};
  if (!chat.modohorny) {
    return await conn.sendMessage(chatId, {
      text: "🔞 El modo *NSFW* está desactivado en este grupo.",
    }, { quoted: msg });
  }

  // Registrar el listener UNA vez SOLO
  if (!listenerRegistrado) {
    listenerRegistrado = true;
    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const user = m.key.participant || m.key.remoteJid;

      if (!cachePack[reactedMsgId]) return;
      if (user !== cachePack[reactedMsgId].sender) return;

      if ((usosPackUsuario[user] || 0) >= 3) {
        return await conn.sendMessage(cachePack[reactedMsgId].chatId, {
          text: "❌ Ya viste suficiente por ahora. Espera 5 minutos para seguir viendo 🔥.",
          mentions: [user],
        });
      }

      const { chatId } = cachePack[reactedMsgId];
      const newUrl = packUrls[Math.floor(Math.random() * packUrls.length)];

      const newMsg = await conn.sendMessage(chatId, {
        image: { url: newUrl },
        caption: "🔥 Otro pack más... Reacciona de nuevo si quieres otro.",
      });

      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      cachePack[newMsg.key.id] = {
        chatId,
        sender: user,
      };
      delete cachePack[reactedMsgId];

      usosPackUsuario[user] = (usosPackUsuario[user] || 0) + 1;

      setTimeout(() => {
        usosPackUsuario[user] = 0;
      }, 5 * 60 * 1000); // 5 minutos
    });
  }

  try {
    await conn.sendMessage(chatId, {
      react: {
        text: "🕒",
        key: msg.key,
      },
    });

    const url = packUrls[Math.floor(Math.random() * packUrls.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url },
      caption: "🔥 Reacciona a esta imagen para ver otro pack.",
    }, { quoted: msg });

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

    usosPackUsuario[sender] = usosPackUsuario[sender] || 0;

  } catch (e) {
    console.error("❌ Error en .pack:", e);
    await msg.reply("❌ No se pudo obtener el pack.");
  }
};

handler.command = ["pack"];
handler.tags = ["nsfw"];
handler.help = ["pack"];

module.exports = handler;