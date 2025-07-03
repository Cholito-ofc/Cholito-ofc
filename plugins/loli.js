const axios = require("axios");

let cachePornololi = {}; // ID del mensaje => { chatId, data }

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

    // Guardamos el mensaje para saber si reaccionan a él
    cachePornololi[sentMsg.key.id] = {
      chatId,
      data
    };

  } catch (e) {
    console.error("❌ Error en .pornololi:", e);
    await msg.reply("❌ No se pudo obtener el contenido.");
  }
};

// SOLO UNA VEZ: activar el listener global
let escuchando = false;

handler.register = (conn) => {
  if (escuchando) return;
  escuchando = true;

  conn.ev.on("messages.upsert", async ({ messages }) => {
    let m = messages[0];
    if (!m?.message?.reactionMessage) return;

    const reaction = m.message.reactionMessage;
    const reactedMsgId = reaction.key?.id;
    const chatId = reaction.key?.remoteJid;

    // Verificamos si la reacción fue a un mensaje nuestro
    if (!cachePornololi[reactedMsgId]) return;

    const { data } = cachePornololi[reactedMsgId];
    const randomUrl = data[Math.floor(Math.random() * data.length)];

    const newMsg = await conn.sendMessage(chatId, {
      image: { url: randomUrl },
      caption: "🥵 Otra más... Reacciona de nuevo.",
    });

    // Guardamos el nuevo mensaje y eliminamos el anterior
    cachePornololi[newMsg.key.id] = {
      chatId,
      data
    };
    delete cachePornololi[reactedMsgId];
  });
};

handler.command = ["pornololi"];
handler.tags = ["nsfw"];
handler.help = ["pornololi"];
module.exports = handler;