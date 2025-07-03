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

    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/booty.json");
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

    // ESCUCHAR REACCIONES ESTILO VS4
    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const user = m.key.participant || m.key.remoteJid;

      // Verifica si la reacción es válida
      if (!cachePornololi[reactedMsgId]) return;
      if (user !== cachePornololi[reactedMsgId].sender) return;

      // Limite de 3 reacciones
      if ((usosPorUsuario[user] || 0) >= 3) {
        return await conn.sendMessage(cachePornololi[reactedMsgId].chatId, {
          text: `❌ Ya viste suficiente por ahora.\n🕒 Espera *5 minutos* para seguir viendo contenido 😏.`,
          mentions: [user],
        });
      }

      const { chatId, data } = cachePornololi[reactedMsgId];
      const newUrl = data[Math.floor(Math.random() * data.length)];

      const newMsg = await conn.sendMessage(chatId, {
        image: { url: newUrl },
        caption: "🥵 Otra más... Reacciona de nuevo.",
      });

      await conn.sendMessage(chatId, {
        react: {
          text: "✅",
          key: newMsg.key,
        },
      });

      // Guardar nuevo y eliminar anterior
      cachePornololi[newMsg.key.id] = {
        chatId,
        data,
        sender: user
      };
      delete cachePornololi[reactedMsgId];

      // Sumar reacción
      usosPorUsuario[user] = (usosPorUsuario[user] || 0) + 1;

      // Reset después de 5 minutos
      setTimeout(() => {
        usosPorUsuario[user] = 0;
      }, 5 * 60 * 1000); // 5 min
    });

  } catch (e) {
    console.error("❌ Error en .pornololi:", e);
    await msg.reply("❌ No se pudo obtener el contenido.");
  }
};

handler.command = ["loli"];
handler.tags = ["nsfw"];
handler.help = ["pornololi"];
module.exports = handler;