const axios = require("axios");
const cheerio = require("cheerio");
const { lookup } = require("mime-types");

const handler = async (msg, { conn, text }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderClean = sender.replace(/[^0-9]/g, "");

  console.log("[MEDIAFIRE] comando activado");

  if (!text || !text.includes("mediafire.com")) {
    return conn.sendMessage(chatId, {
      text: `🚫 *Acción mal usada:*\n\nDebes enviar un enlace válido de Mediafire para descargar un archivo.\n\n*📌 Ejemplo:*\n.mediafire https://www.mediafire.com/file/archivo`,
      mentions: [sender]
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: "⏳", key: msg.key } });

  try {
    console.log("[MEDIAFIRE] intentando scrapear el enlace:", text);
    const res = await mediafire(text);
    console.log("[MEDIAFIRE] datos extraídos:", res);

    const mensaje = `
\`「 DESCARGA MEDIAFIRE 📦 」\`

*📁 Nombre:* ${res.filename}
*📂 Tipo:* ${res.ext.toUpperCase()}
*📐 Tamaño:* ${res.size}
*📄 MIME:* ${res.mimetype}
*🗓️ Subido:* ${res.uploadDate}
*🔗 Enlace:* ${res.url}
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
          jpegThumbnail: (await axios.get('https://iili.io/F0WZNEX.th.png', { responseType: 'arraybuffer' })).data,
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
    console.error("[MEDIAFIRE ERROR]", err);
    await conn.sendMessage(chatId, { react: { text: "❌", key: msg.key } });
    return conn.sendMessage(chatId, {
      text: `❌ *Ocurrió un error:*\n\`\`\`${err.message || err}\`\`\``,
      mentions: [sender]
    }, { quoted: msg });
  }
};

handler.command = ["mediafire", "mf", "mfdl"];
module.exports = handler;

// ──────── SCRAPER DE MEDIAFIRE ────────
async function mediafire(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                  'Chrome/115.0.0.0 Safari/537.36'
  };

  const res = await axios.get(url, { headers });
  const $ = cheerio.load(res.data);

  const filename = $('.dl-btn-label').attr('title') || $('a#downloadButton').text().trim();
  if (!filename) throw new Error("Nombre del archivo no detectado.");

  const download = $('a#downloadButton').attr('href');
  if (!download) throw new Error("Enlace de descarga no encontrado.");

  const extMatch = filename.match(/\.([0-9a-z]+)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : "bin";
  const mimetype = lookup(ext) || `application/${ext}`;

  const sizeText = $(".download_file_info span").text().trim();
  const sizeMatch = sizeText.match(/\((.*?)\)/);
  const size = sizeMatch ? sizeMatch[1] : "desconocido";

  const dataCreation = $("[data-creation]").attr("data-creation");
  let uploadDate = "No disponible";
  if (dataCreation && !isNaN(dataCreation)) {
    const date = new Date(parseInt(dataCreation) * 1000);
    uploadDate = date.toLocaleDateString("es-ES", {
      day: "numeric", month: "long", year: "numeric"
    });
  }

  return { filename, ext, mimetype, size, download, uploadDate, url };
}