const axios = require("axios");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const FormData = require("form-data");
const path = require("path");
const fs = require("fs");

const handler = async (msg, { conn }) => {
  const quoted = msg.quoted?.message || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mime = quoted ? Object.keys(quoted)[0] : null;
  const isImage = mime === "imageMessage";

  if (!quoted || !isImage) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `📸 *| COMANDO:* *hd*\n\n🧠 *Responde a una imagen para mejorarla en calidad HD (x4).*`,
    }, { quoted: msg });
  }

  try {
    // Descargar la imagen
    const buffer = await downloadMediaMessage(
      { message: quoted },
      "buffer",
      {},
      { logger: console }
    );

    // Guardar como archivo temporal .jpg
    const tempPath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.writeFileSync(tempPath, buffer);

    // Crear formulario para enviar a la API Pixelcut
    const form = new FormData();
    form.append("image_file", fs.createReadStream(tempPath), {
      filename: "image.jpg",
      contentType: "image/jpeg"
    });

    const response = await axios.post(
      "https://api2.pixelcut.app/image/upscale/v1",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "User-Agent": "KilluaBot/1.0"
        },
        responseType: "arraybuffer"
      }
    );

    // Enviar imagen mejorada al chat
    await conn.sendMessage(msg.key.remoteJid, {
      image: response.data,
      caption: `🔍 *Imagen mejorada en HD (x4)*\n✨ _Potenciado por Killua Bot_`,
    }, { quoted: msg });

    // Eliminar archivo temporal
    fs.unlinkSync(tempPath);

  } catch (err) {
    console.error("🔥 Error al mejorar imagen (Pixelcut):", err);
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ *Ocurrió un error al mejorar la imagen.*\nRevisa si la imagen es válida y vuelve a intentarlo.`,
    }, { quoted: msg });
  }
};

handler.command = ["hd"];
handler.help = ["hd (responde a una imagen)"];
handler.tags = ["ia", "imagen"];
handler.register = true;

module.exports = handler;