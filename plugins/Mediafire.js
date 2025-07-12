const fs = require("fs");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { lookup } = require("mime-types");

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderClean = sender.replace(/[^0-9]/g, "");

  if (!text || !text.includes("mediafire.com")) {
    return conn.sendMessage(chatId, {
      text: `🚫 *Acción mal usada:*\n\nDebes enviar un enlace válido de Mediafire para descargar un archivo.\n\n*📌 Ejemplo:*\n.mediafire https://www.mediafire.com/file/archivo`,
      mentions: [sender]
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

  try {
    const res = await mediafire(text);
    const mensaje = `
\`「 DESCARGA MEDIAFIRE 📦 」\`

*📁 Nombre:* ${res.filename}
*📂 Tipo:* ${res.ext.toUpperCase()}
*📐 Tamaño:* ${res.size}
*📄 MIME:* ${res.mimetype}
*🗓️ Subido:* ${res.uploadDate}
*🔗 URL:* ${res.url}
`.trim();

    const fkontak = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: "Mediafire"
      },
      message: {
        locationMessage: {
          name: "Descarga Mediafire",
          jpegThumbnail: await (await fetch('https://iili.io/F0WZNEX.th.png')).buffer(),
          vcard:
            "BEGIN:VCARD\n" +
            "VERSION:3.0\n" +
            "N:;Unlimited;;;\n" +
            "FN:Unlimited\n" +
            "ORG:Unlimited\n" +
            "TITLE:\n" +
            "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
            "item1.X-ABLabel:Unlimited\n" +
            "X-WA-BIZ-DESCRIPTION:ofc\n" +
            "X-WA-BIZ-NAME:Unlimited\n" +
            "END:VCARD"
        }
      },
      participant: "0@s.whatsapp.net"
    };

    await conn.sendMessage(chatId, {
      document: { url: res.download },
      fileName: res.filename,
      mimetype: res.mimetype,
      caption: mensaje,
    }, { quoted: fkontak });

    await conn.sendMessage(chatId, { react: { text: "✅", key: msg.key } });
  } catch (err) {
    await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
    return conn.sendMessage(chatId, {
      text: `❌ *Ocurrió un error al procesar el enlace.*\nIntenta con otro link o más tarde.`,
      mentions: [sender]
    }, { quoted: msg });
  }
};

handler.command = ["mediafire", "mf", "mfdl"];
module.exports = handler;

// ─── FUNCIÓN DE DESCARGA ─────────────────────
async function mediafire(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const filename = $(".dl-btn-label").attr("title");
  if (!filename) throw new Error("No se encontró el nombre del archivo.");

  const extMatch = filename.match(/\.([^\.]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : "desconocido";
  const mimetype = lookup(ext) || `application/${ext}`;
  const sizeText = $(".download_link .input").text().trim();
  const sizeMatch = sizeText.match(/\((.*?)\)/);
  const size = sizeMatch ? sizeMatch[1] : "desconocido";
  const download = $(".input").attr("href");
  if (!download) throw new Error("No se encontró el enlace de descarga.");

  let uploadDate = "Fecha no encontrada";
  const dataCreation = $("[data-creation]").attr("data-creation");
  if (dataCreation && !isNaN(dataCreation)) {
    const date = new Date(parseInt(dataCreation) * 1000);
    uploadDate = date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  return { filename, ext, mimetype, size, download, uploadDate, url };
}