const axios = require("axios");

const handler = async (msg, { conn }) => {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json");
    const url = res.data[Math.floor(Math.random() * res.data.length)];

    await conn.sendMessage(msg.key.remoteJid, {
      image: { url },
      caption: "🥵 Aquí tienes una loli 🔞",
      footer: "Presiona el botón para otra imagen",
      buttons: [
        {
          buttonId: ".pornololi",
          buttonText: { displayText: "🔁 Siguiente" },
          type: 1
        }
      ],
      headerType: 4
    }, { quoted: msg });

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