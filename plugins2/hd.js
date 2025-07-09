const axios = require("axios");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const handler = async (msg, { conn }) => {
  const mime = (msg.quoted?.mimetype || msg.mimetype) || "";
  const isImage = mime.startsWith("image/");

  if (!msg.quoted || !isImage) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `📸 *| COMANDO:* *hd*\n\n💡 *Responde a una imagen para mejorarla con calidad HD (x4).*`,
    }, { quoted: msg });
  }

  try {
    // Descargar imagen
    const mediaBuffer = await downloadMediaMessage(msg.quoted, "buffer", {}, { logger: console });
    const tempFile = path.join(__dirname, `hd_${Date.now()}.jpg`);
    fs.writeFileSync(tempFile, mediaBuffer);

    // Subir a servidor temporal (Uguu)
    const form = new FormData();
    form.append("file", fs.createReadStream(tempFile));
    const upload = await axios.post("https://uguu.se/upload.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = upload.data.files[0].url;

    // Enviar a la API externa para mejorar
    const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/upscale?imageUrl=${encodeURIComponent(imageUrl)}&resize=4`;
    const result = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Enviar la imagen mejorada
    await conn.sendMessage(msg.key.remoteJid, {
      image: result.data,
      caption: `🔍 *Imagen mejorada en HD (x4)*\n✨ _Potenciado por Killua Bot_`,
    }, { quoted: msg });

    fs.unlinkSync(tempFile);

  } catch (err) {
    console.error("❌ Error al mejorar imagen:", err);
    await conn.sendMessage(msg.key.remoteJid, {
      text: `⚠️ *Ocurrió un error al mejorar la imagen.*\nInténtalo más tarde.`,
    }, { quoted: msg });
  }
};

handler.command = ["hd"];
handler.help = ["hd (responde a una imagen)"];
handler.tags = ["ia", "imagen"];
handler.register = true;

module.exports = handler;