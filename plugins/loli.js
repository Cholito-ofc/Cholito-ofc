const axios = require("axios");

let cachePornololi = {};

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  try {
    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json");
    const data = res.data;
    const url = data[Math.floor(Math.random() * data.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url },
      caption: "🥵 Reacciona a este mensaje para ver otra imagen.",
    }, { quoted: msg });

    cachePornololi[sentMsg.key.id] = {
      chatId,
      data,
    };

    // Escuchar reacciones SOLO después de enviar la primera imagen
    conn.ev.on("messages.upsert", async ({ messages }) => {
      const m = messages[0];
      if (!m?.message?.reactionMessage) return;

      const reaction = m.message.reactionMessage;
      const reactedMsgId = reaction.key?.id;
      const emoji = reaction.text;

      if (!cachePornololi[reactedMsgId]) return;

      const { chatId, data } = cachePornololi[reactedMsgId];
      const newUrl = data[Math.floor(Math.random() * data.length)];

      const newMsg = await conn.sendMessage(chatId, {
        image: { url: newUrl },
        caption: "🥵 Otra más... Reacciona de nuevo para seguir viendo.",
      });

      // Guardar nuevo y eliminar anterior
      cachePornololi[newMsg.key.id] = { chatId, data };
      delete cachePornololi[reactedMsgId];
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