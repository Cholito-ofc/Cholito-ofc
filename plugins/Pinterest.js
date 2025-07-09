const axios = require("axios");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;

  if (!args[0]) {
    return await conn.sendMessage(chatId, { text: "✳️ Ingresa una búsqueda, ejemplo: *.pin gatos*" }, { quoted: msg });
  }

  try {
    const res = await axios.get(`https://api.neoxr.eu/api/pinterest?q=${encodeURIComponent(args.join(" "))}&apikey=rusellxyz`);
    const result = res.data?.data?.[0]; // Asegúrate que exista data

    if (!result) {
      return await conn.sendMessage(chatId, { text: "❌ No encontré resultados." }, { quoted: msg });
    }

    await conn.sendMessage(chatId, { image: { url: result }, caption: "🔍 Resultado de Pinterest" }, { quoted: msg });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(chatId, { text: "❌ Error al obtener resultados de Pinterest." }, { quoted: msg });
  }
};

handler.command = ["pin", "pinterest"];
handler.tags = ["internet"];
handler.help = ["pin <texto>"];

module.exports = handler;