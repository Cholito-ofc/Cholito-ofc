const fs = require("fs");
const path = require("path");
const axios = require("axios");

const tiemposPath = path.resolve("./tiempos.json");
// Ya no necesitas ruta local, porque usaremos URL:
// const relojPath = "./media/reloj.png"; 

// Cambia aquí la URL de tu imagen redonda:
const urlImagen = 'https://cdn.russellxz.click/39109c83.jpeg'; 

function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleString("es-MX", {
    timeZone: "America/Mexico_City",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function formatearDiaCompleto(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long",
    day: "2-digit",
    month: "long"
  });
}

function calcularDiasRestantes(fechaFutura) {
  const hoy = new Date();
  return Math.ceil((fechaFutura - hoy) / (1000 * 60 * 60 * 24));
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = isGroup ? (msg.key.participant || msg.participant || msg.key.remoteJid) : msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const command = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

  const OWNERS = ["31375424024748", "50489513153"];
  const isOwner = OWNERS.includes(senderNum);

  let metadata = null;
  let participant = null;
  let isAdmin = false;

  if (isGroup) {
    try {
      metadata = await conn.groupMetadata(chatId);
      participant = metadata.participants.find(p => p.id === senderId);
      isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
    } catch (e) {
      console.error("Error al obtener metadata del grupo:", e.message);
    }
  }

  const tiempos = fs.existsSync(tiemposPath) ? JSON.parse(fs.readFileSync(tiemposPath)) : {};

  // Descarga la imagen desde la URL para obtener el buffer
  let bufferImagen;
  try {
    const response = await axios.get(urlImagen, { responseType: "arraybuffer" });
    bufferImagen = Buffer.from(response.data, "binary");
  } catch (e) {
    console.error("Error al descargar la imagen:", e.message);
    bufferImagen = null;
  }

  // Contacto modificado con imagen personalizada desde URL
  const fkontak = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      id: "Killua"
    },
    message: {
      imageMessage: {
        mimetype: "image/jpeg", // o "image/png" si tu imagen es PNG
        jpegThumbnail: bufferImagen || Buffer.from([]), // si falla, vacío para evitar error
        caption: "⏰ Tiempo activo",
        fileSha256: Buffer.from([]),
        fileLength: "0",
        height: 100,
        width: 100
      }
    }
  };

  // .tiempos <días>
  if (command.startsWith(".tiempos")) {
    if (!isOwner) return conn.sendMessage(chatId, { text: "🚫 *Solo el owner puede usar este comando.*" }, { quoted: msg });

    const dias = parseInt(args[0]);
    if (isNaN(dias) || dias <= 0) {
      return conn.sendMessage(chatId, {
        text: "⚠️ Especifica un número válido de días. Ejemplo: *.tiempos 30*"
      }, { quoted: msg });
    }

    const fechaActual = Date.now();
    const fechaFin = fechaActual + dias * 24 * 60 * 60 * 1000;
    tiempos[chatId] = { inicio: fechaActual, fin: fechaFin };
    fs.writeFileSync(tiemposPath, JSON.stringify(tiempos, null, 2));

    return conn.sendMessage(chatId, {
      text: `➤ \`ORDENES RECIBIDAS\` ✅\n\n\`\`\`Finaliza en: ${dias} días.\`\`\`\n\`\`\`Fecha: ${formatearFecha(fechaFin)}\`\`\`\n\`\`\`Grupo: ${metadata?.subject || "Grupo desconocido"}\`\`\``
    }, { quoted: fkontak });
  }

  // .verfecha
  if (command.startsWith(".verfecha")) {
    if (!isOwner && !isAdmin) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores y el owner pueden usar este comando.*"
      }, { quoted: msg });
    }

    if (!tiempos[chatId]) {
      return conn.sendMessage(chatId, {
        text: "❌ No se ha establecido ningún tiempo para este grupo."
      }, { quoted: msg });
    }

    const { fin } = tiempos[chatId];
    const diasRestantes = calcularDiasRestantes(fin);
    const fechaTexto = formatearDiaCompleto(fin);
    const horaTexto = formatearFecha(fin).split(", ")[1];

    return conn.sendMessage(chatId, {
      text: `📅 \`SHOWDATE\` 🔔\n\n\`\`\`Próximo ${fechaTexto}\`\`\`\n\`\`\`Hora exacta: ${horaTexto} (hora CDMX)\`\`\`\n\`\`\`Quedan, ${diasRestantes} días.\`\`\`\n\n> 𝖴𝗌𝖾 .𝗋𝖾𝗇𝗈𝗏𝖺𝗋`
    }, { quoted: fkontak });
  }

  // .renovar
  if (command.startsWith(".renovar")) {
    if (!isOwner && !isAdmin) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo los administradores y el owner pueden usar este comando.*"
      }, { quoted: msg });
    }

    const ownersInfo = [
      { name: "Cholito", number: "50489513153" },
      { name: "Support", number: "31375424024748" }
    ];

    const contacts = ownersInfo.map(o => ({
      displayName: o.name,
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${o.name}\nTEL;type=CELL;type=VOICE;waid=${o.number}:${o.number}\nEND:VCARD`
    }));

    return conn.sendMessage(chatId, { contacts }, { quoted: fkontak });
  }
};

handler.command = ["tiempos", "verfecha", "renovar"];
handler.tags = ["tools"];
handler.help = [".tiempos <días>", ".verfecha", ".renovar"];

module.exports = handler;