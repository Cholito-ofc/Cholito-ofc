const axios = require("axios");

const temporales = {}; // Para almacenar búsquedas por chat

module.exports = async (msg, { conn, text }) => {
  const jid = msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(jid, {
      text: `✳️ Escribe:\n.ttsearch <búsqueda>\nEj: *ttsearch* edits messi`,
    }, { quoted: msg });
  }

  // Reacción de carga
  await conn.sendMessage(jid, {
    react: { text: "🔍", key: msg.key }
  });

  // Buscar videos
  let res;
  try {
    res = await axios.get(`https://api.siputzx.my.id/api/s/tiktok?query=sadencodeURIComponent(text)}`);
  } catch (e) {
    return conn.sendMessage(jid, {
      text: `❌ Error al buscar: ${e.message}`
    }, { quoted: msg });
  }

  const resultados = res.data?.result || [];
  if (!resultados.length) {
    return conn.sendMessage(jid, {
      text: "❌ No se encontraron resultados.",
    }, { quoted: msg });
  }

  const lista = resultados.slice(0, 10).map((v, i) => `*${i + 1}.* ${v.title || 'Sin título'}`).join("\n\n");

  temporales[jid] = {
    resultados,
    usuario: msg.key.participant || msg.key.remoteJid,
    tiempo: Date.now()
  };

  await conn.sendMessage(jid, {
    text: `🔍 *Resultados encontrados:*\n\n${lista}\n\n📌 *Responde con un número del 1 al 10* para descargar esa cantidad de videos.`,
  }, { quoted: msg });
};

module.exports.before = async function (msg, { conn }) {
  const jid = msg.key.remoteJid;
  const entrada = temporales[jid];

  if (!entrada) return;
  if ((msg.key.participant || msg.key.remoteJid) !== entrada.usuario) return;

  const num = parseInt(msg.message?.conversation || "");
  if (!num || num < 1 || num > 10) {
    return conn.sendMessage(jid, {
      text: "❗ Ingresa un número válido entre *1 y 10*."
    }, { quoted: msg });
  }

  delete temporales[jid];

  const seleccionados = entrada.resultados.slice(0, num);
  await conn.sendMessage(jid, {
    text: `⏳ Descargando ${num} video(s)...`
  }, { quoted: msg });

  for (let video of seleccionados) {
    try {
      const link = `https://api.siputzx.my.id/api/download/tiktok?url=${encodeURIComponent(video.url)}`;
      const r = await axios.get(link);
      const urlVideo = r.data?.result?.video || r.data?.result?.url;

      if (!urlVideo) continue;

      await conn.sendMessage(jid, {
        video: { url: urlVideo },
        caption: video.title || "🎬 Video TikTok"
      }, { quoted: msg });

    } catch (e) {
      await conn.sendMessage(jid, {
        text: `❌ Error con el video:\n${video.title || "sin título"}`
      }, { quoted: msg });
    }
  }

  return true;
};

module.exports.command = ["ttsearch"];