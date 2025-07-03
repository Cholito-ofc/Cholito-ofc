const axios = require("axios");
const fs = require("fs");

let cacheVideo = {};
let usosPorUsuario = {};

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // Verificar si el modo caliente está activo
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
    // Reacción mientras carga
    await conn.sendMessage(chatId, {
      react: {
        text: "🕒",
        key: msg.key,
      },
    });

    // Reemplaza esta URL si tienes otro JSON con videos
    const res = await axios.get("https://github.com/BrunoSobrino/TheMystic-Bot-MD/blob/master/src%2FJSON%2Fporno.json");
    const data = res.data;
    const url = data[Math.floor(Math.random() * data.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      video: { url },
      caption: "🎥 Reacciona para ver otro *video XXX* 🔞.",
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: {
        text: "✅",
        key: sentMsg.key,
      },
    });

    cacheVideo[sentMsg.key.id] = {
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

      if (!cacheVideo[reactedMsgId]) return;
      if (user !== cacheVideo[reactedMsgId].sender) return;

      if ((usosPorUsuario[user] || 0) >= 3) {
        return await conn.sendMessage(chatId, {
          text: `❌ Ya viste suficientes *videos* por ahora.\n🕒 Espera *5 minutos* para seguir viendo 🔥.`,
          mentions: [user],
        });
      }

      const { data } = cacheVideo[reactedMsgId];
      const newUrl = data[Math.floor(Math.random() * data.length)];

      const newMsg = await conn.sendMessage(chatId, {
        video: { url: newUrl },
        caption: "🎥 Otro video XXX... Reacciona si quieres otro 🔥.",
      });

      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      cacheVideo[newMsg.key.id] = {
        chatId,
        data,
        sender: user,
      };
      delete cacheVideo[reactedMsgId];

      usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;

      setTimeout(() => {
        usosPorUsuario[user] = 0;
      }, 5 * 60 * 1000);
    });

  } catch (e) {
    console.error("❌ Error en .videoxxx:", e);
    await conn.sendMessage(chatId, {
      text: "❌ No se pudo obtener el video.",
    }, { quoted: msg });
  }
};

handler.command = ["videoxxx"];
handler.tags = ["nsfw"];
handler.help = ["videoxxx"];
module.exports = handler;