const axios = require("axios");

let cachePornololi = {};

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  try {
    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json");
    const data = res.data;
    const randomUrl = data[Math.floor(Math.random() * data.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url: randomUrl },
      caption: "🥵 Reacciona a este mensaje para ver otra imagen.",
    }, { quoted: msg });

    cachePornololi[sentMsg.key.id] = {
      chatId,
      data,
    };

  } catch (e) {
    console.error("❌ Error en comando pornololi:", e);
    await msg.reply("❌ No se pudo obtener el contenido.");
  }
};

// Escuchar reacciones
const reactionHandler = async ({ messages }) => {
  let m = messages[0];
  if (!m?.message?.reactionMessage) return;

  const reaction = m.message.reactionMessage;
  const key = reaction.key;
  const reactedMsgId = key?.id;
  const chatId = key?.remoteJid;

  if (!cachePornololi[reactedMsgId]) return;

  const { data } = cachePornololi[reactedMsgId];
  const newUrl = data[Math.floor(Math.random() * data.length)];

  const newMsg = await conn.sendMessage(chatId, {
    image: { url: newUrl },
    caption: "🥵 Otra más... Reacciona de nuevo para seguir viendo.",
  });

  cachePornololi[newMsg.key.id] = { chatId, data };
  delete cachePornololi[reactedMsgId];
};

// Activar listener una sola vez
let listenerActivo = false;
handler.register = (conn) => {
  if (listenerActivo) return;
  listenerActivo = true;
  conn.ev.on("messages.upsert", reactionHandler);
};

handler.command = ["pornololi"];
handler.tags = ["nsfw"];
handler.help = ["pornololi"];
module.exports = handler;