const axios = require("axios");
const fs = require("fs");

let cacheTetas = {}; // ID mensaje => { chatId, data }
let usosPorUsuario = {}; // usuario => cantidad

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // Verifica si el modo caliente está activado
  const activos = fs.existsSync('./activos.json')
    ? JSON.parse(fs.readFileSync('./activos.json', 'utf-8'))
    : {};

  if (!activos.modocaliente || !activos.modocaliente[chatId]) {
    await conn.sendMessage(chatId, {
      text: "🔞 El *modo caliente* está desactivado en este grupo.\nActívalo con: *.modocaliente on*"
    }, { quoted: msg });
    return;
  }

  try {
    // Reacción de "procesando"
    await conn.sendMessage(chatId, {
      react: {
        text: "🕒",
        key: msg.key,
      },
    });

    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/tetas.json");
    const data = res.data;
    const url = data[Math.floor(Math.random() * data.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url },
      caption: "🔞 Reacciona para ver más *tetas* 🍒.",
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: sentMsg.key,
      },
    });

    cacheTetas[sentMsg.key.id] = {
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

      if (!cacheTetas[reactedMsgId]) return;
      if (user !== cacheTetas[reactedMsgId].sender) return;

      if ((usosPorUsuario[user] || 0) >= 3) {
        return await conn.sendMessage(chatId, {
          text: `❌ Ya viste suficientes *tetas* por ahora.\n🕒 Espera *5 minutos* para seguir viendo 🍑.`,
          mentions: [user],
        });
      }

      const { data } = cacheTetas[reactedMsgId];
      const newUrl = data[Math.floor(Math.random() * data.length)];

      const newMsg = await conn.sendMessage(chatId, {
        image: { url: newUrl },
        caption: "🔞 Más *tetas* para ti... Reacciona de nuevo 🍒.",
      });

      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      cacheTetas[newMsg.key.id] = {
        chatId,
        data,
        sender: user,
      };
      delete cacheTetas[reactedMsgId];

      usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;

      setTimeout(() => {
        usosPorUsuario[user] = 0;
      }, 5 * 60 * 1000); // 5 minutos
    });

  } catch (e) {
    console.error("❌ Error en .tetas:", e);
    await conn.sendMessage(chatId, {
      text: "❌ No se pudo obtener el contenido.",
    }, { quoted: msg });
  }
};

handler.command = ["tetas"];
handler.tags = ["nsfw"];
handler.help = ["tetas"];
module.exports = handler;