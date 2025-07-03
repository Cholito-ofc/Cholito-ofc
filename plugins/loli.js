const axios = require("axios");

const handler = async (msg, { conn }) => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json");
    const url = res.data[Math.floor(Math.random() * res.data.length)];

    const templateMessage = {
      image: { url },
      caption: "🥵 Aquí tienes una loli 🔞",
      footer: "Presiona el botón para ver otra imagen",
      templateButtons: [
        {
          index: 1,
          quickReplyButton: {
            displayText: "🔁 Siguiente",
            id: ".pornololi"
          }
        }
      ]
    };

    await conn.sendMessage(msg.key.remoteJid, templateMessage, { quoted: msg });

  } catch (e) {
    console.error("❌ Error en comando pornololi:", e);
    await conn.sendMessage(msg.key.remoteJid, {
      text: "❌ No se pudo obtener el contenido."
    }, { quoted: msg });
  }
};

handler.command = ["pornololi"];
handler.tags = ["nsfw"];
handler.help = ["pornololi"];
module.exports = handler;