const axios = require("axios");

let cachePornololi = {}

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid

  try {
    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json");
    const data = res.data;
    const randomUrl = data[Math.floor(Math.random() * data.length)];

    const sentMsg = await conn.sendMessage(chatId, {
      image: { url: randomUrl },
      caption: "🥵 Reacciona a este mensaje para ver otra imagen.",
    }, { quoted: msg });

    // Guardamos el mensaje enviado para identificarlo cuando reaccionen
    cachePornololi[sentMsg.key.id] = {
      chatId,
      data,
    }

  } catch (e) {
    console.error("❌ Error en comando pornololi:", e);
    await msg.reply("❌ No se pudo obtener el contenido.");
  }
};

// Escuchar reacciones
handler.before = async function (msg, { conn }) {
  if (!msg.message?.reactionMessage) return;

  const reaction = msg.message.reactionMessage;
  const key = reaction.key;
  const emoji = reaction.text;
  const reactedMsgId = key?.id;
  const chatId = key?.remoteJid;

  if (!cachePornololi[reactedMsgId]) return;

  const { data } = cachePornololi[reactedMsgId];

  const randomUrl = data[Math.floor(Math.random() * data.length)];

  const newMsg = await conn.sendMessage(chatId, {
    image: { url: randomUrl },
    caption: "🥵 Otra más... Reacciona de nuevo para seguir viendo.",
  });

  // Guardar nuevo mensaje para seguir cadena
  cachePornololi[newMsg.key.id] = {
    chatId,
    data,
  };

  // Borrar el anterior para evitar crecer la memoria
  delete cachePornololi[reactedMsgId];
}

handler.command = ["pornololi"];
handler.tags = ["nsfw"];
handler.help = ["pornololi"];
module.exports = handler;