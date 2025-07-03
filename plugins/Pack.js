const imagenesXXX = [
  "https://cdn.russellxz.click/56b2e2b4.jpeg",
  "https://cdn.russellxz.click/556fa4bc.jpeg",
  "https://cdn.russellxz.click/5b056ca3.jpeg",
  // más URLs aquí
];

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

    // Elegir URL aleatoria de arreglo local
    const url = imagenesXXX[Math.floor(Math.random() * imagenesXXX.length)];

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

    // Guardar imagen enviada y el arreglo (data) para reacciones
    cachePornololi[sentMsg.key.id] = {
      chatId,
      data: imagenesXXX,
      sender,
    };

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