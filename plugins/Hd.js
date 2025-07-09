const axios = require("axios");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const handler = async (msg, { conn }) => {
  const quoted = msg.quoted?.message || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mime = quoted ? Object.keys(quoted)[0] : null;
  const isImage = mime === "imageMessage";

  if (!quoted || !isImage) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `📸 *| COMANDO:* *hd*\n\n💡 *Responde a una imagen para mejorarla con calidad HD (x4).*`,
    }, { quoted: msg });
  }

  try {
    // Descargar imagen citada
    const mediaBuffer = await downloadMediaMessage(
      { message: quoted },
      "buffer",
      {},
      { logger: console }
    );

    const tempFile = path.join(__dirname, `hd_${Date.now()}.jpg`);
    fs.writeFileSync(tempFile, mediaBuffer);

    // Subir imagen a servidor temporal
    const form = new FormData();
    form.append("file", fs.createReadStream(tempFile));
    const upload = await axios.post("https://uguu.se/upload.php", form, {
      headers: form.getHeaders(),
    });

    const imageUrl = upload.data.files[0].url;

    // Enviar imagen a API para mejorarla
    const apiUrl = `https://fastrestapis.fasturl.cloud/aiimage/upscale?imageUrl=${encodeURIComponent(imageUrl)}&resize=4`;
    const result = await axios.get(apiUrl, { responseType: "arraybuffer" });

    // Enviar imagen mejorada
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