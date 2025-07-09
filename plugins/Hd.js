const axios = require("axios");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const FormData = require("form-data");

const handler = async (msg, { conn }) => {
  const quoted = msg.quoted?.message || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mime = quoted ? Object.keys(quoted)[0] : null;
  const isImage = mime === "imageMessage";

  if (!quoted || !isImage) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `🖼️ *| COMANDO:* *hd*\n\n📌 *Responde a una imagen para mejorarla con calidad HD (x4).*`,
    }, { quoted: msg });
  }

  try {
    // Descargar imagen como buffer
    const mediaBuffer = await downloadMediaMessage(
      { message: quoted },
      "buffer",
      {},
      { logger: console }
    );

    // Crear form-data para enviar a Pixelcut
    const form = new FormData();
    form.append("image_file", mediaBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    // Enviar a la API Pixelcut
    const response = await axios.post("https://api2.pixelcut.app/image/upscale/v1", form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
    });

    // Enviar imagen mejorada al chat
    await conn.sendMessage(msg.key.remoteJid, {
      image: response.data,
      caption: `🧠 *Imagen mejorada en HD (x4)*\n🔧 _Potenciado por Killua Bot_`,
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Error en Pixelcut API:", err);
    await conn.sendMessage(msg.key.remoteJid, {
      text: `❌ *Error al mejorar la imagen.*\nLa API pudo haber fallado o la imagen no es válida.`,
    }, { quoted: msg });
  }
};

handler.command = ["hd"];
handler.help = ["hd (responde a una imagen)"];
handler.tags = ["ia", "imagen"];
handler.register = true;

module.exports = handler;