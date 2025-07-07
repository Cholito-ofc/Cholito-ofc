// versión modificada del comando .tiempos para aceptar número de grupo

const fs = require("fs");
const path = require("path");

const tiemposPath = path.resolve("./tiempos.json");

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

  let senderId = isGroup ? msg.key.participant || msg.participant || msg.key.remoteJid : msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");

  const OWNERS = ["31375424024748", "50489513153"];
  const isOwner = OWNERS.includes(senderNum);

  const command = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const tiempos = fs.existsSync(tiemposPath) ? JSON.parse(fs.readFileSync(tiemposPath)) : {};

  if (command.startsWith(".tiempos")) {
    if (!isOwner) {
      return conn.sendMessage(chatId, {
        text: "🚫 *Solo el owner puede usar este comando.*"
      }, { quoted: msg });
    }

    const dias = parseInt(args[0]);
    if (isNaN(dias) || dias <= 0) {
      return conn.sendMessage(chatId, {
        text: "⚠️ Especifica un número válido de días. Ejemplo: *.tiempos 30*"
      }, { quoted: msg });
    }

    // Si se proporciona número de grupo, buscarlo en global.gruposAdmin
    let targetGroupId = chatId;
    let grupoNombre = "Este grupo";

    if (args.length >= 2 && /^\d+$/.test(args[1])) {
      const groupNum = args[1];
      const grupo = global.gruposAdmin?.find(g => g.code === groupNum);
      if (!grupo) {
        return conn.sendMessage(chatId, {
          text: `❌ No se encontró ningún grupo con el número *${groupNum}*. Usa *!listgrupos* para ver los disponibles.`
        }, { quoted: msg });
      }
      targetGroupId = grupo.id;
      grupoNombre = grupo.name;
    }

    const fechaActual = Date.now();
    const fechaFin = fechaActual + dias * 24 * 60 * 60 * 1000;

    tiempos[targetGroupId] = {
      inicio: fechaActual,
      fin: fechaFin
    };

    fs.writeFileSync(tiemposPath, JSON.stringify(tiempos, null, 2));

    return conn.sendMessage(chatId, {
      text: `✅ *Tiempo asignado correctamente al grupo:* _${grupoNombre}_\n\n🗓️ Finaliza en: *${dias} días*\n📆 Fecha: ${formatearFecha(fechaFin)}`
    }, { quoted: msg });
  }

  // .verfecha
  if (command.startsWith(".verfecha")) {
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
    }, { quoted: msg });
  }

  // .renovar
  if (command.startsWith(".renovar")) {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";

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

    return conn.sendMessage(chatId, { contacts }, { quoted: msg });
  }
};

handler.command = ["tiempos", "verfecha", "renovar"];
handler.tags = ["tools"];
handler.help = [".tiempos <días> [grupo]", ".verfecha", ".renovar"];

module.exports = handler;