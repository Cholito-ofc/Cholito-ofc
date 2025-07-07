const fs = require("fs");
const path = require("path");

const tiemposPath = path.resolve("./tiempos.json");
const afkPath = path.resolve("./afk.json");

// Cargar AFK en memoria
global.gruposAfk = fs.existsSync(afkPath) ? JSON.parse(fs.readFileSync(afkPath)) : {};

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

  const commandText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
  const tiempos = fs.existsSync(tiemposPath) ? JSON.parse(fs.readFileSync(tiemposPath)) : {};

  // Validar existencia de grupos cargados
  if ([".tiempos", ".afk", ".activar"].some(cmd => commandText.startsWith(cmd))) {
    if (!global.gruposAdmin || global.gruposAdmin.length === 0) {
      return conn.sendMessage(chatId, {
        text: `❌ Primero usa el comando *.listgrupos* para ver los grupos disponibles.`
      }, { quoted: msg });
    }
  }

  // =========================
  // COMANDO: .tiempos <días> <grupo?>
  // =========================
  if (commandText.startsWith(".tiempos")) {
    if (!isOwner) return conn.sendMessage(chatId, { text: "🚫 *Solo el owner puede usar este comando.*" }, { quoted: msg });

    const dias = parseInt(args[0]);
    if (isNaN(dias) || dias <= 0) {
      return conn.sendMessage(chatId, {
        text: "⚠️ Especifica un número válido de días. Ejemplo: *.tiempos 30*"
      }, { quoted: msg });
    }

    let targetGroupId = chatId;
    let grupoNombre = "Este grupo";

    if (args.length >= 2 && /^\d+$/.test(args[1])) {
      const grupo = global.gruposAdmin.find(g => g.code === args[1]);
      if (!grupo) {
        return conn.sendMessage(chatId, {
          text: `❌ No se encontró ningún grupo con el número *${args[1]}*. Usa *.listgrupos* para ver los disponibles.`
        }, { quoted: msg });
      }
      targetGroupId = grupo.id;
      grupoNombre = grupo.name;
    }

    const fechaActual = Date.now();
    const fechaFin = fechaActual + dias * 24 * 60 * 60 * 1000;

    tiempos[targetGroupId] = { inicio: fechaActual, fin: fechaFin };
    fs.writeFileSync(tiemposPath, JSON.stringify(tiempos, null, 2));

    await conn.sendMessage(targetGroupId, {
      text:
        `➤ \`ORDENES RECIBIDAS\` ✅\n\n` +
        `\`\`\`Finaliza en: ${dias} días.\`\`\`\n` +
        `\`\`\`Fecha: ${formatearFecha(fechaFin)}\`\`\`\n` +
        `\`\`\`Grupo: ${grupoNombre}\`\`\``
    });

    return conn.sendMessage(chatId, {
      text: `✅ *El mensaje fue enviado al grupo:* _${grupoNombre}_`
    }, { quoted: msg });
  }

  // =========================
  // COMANDO: .verfecha
  // =========================
  if (commandText.startsWith(".verfecha")) {
    let metadata = null;
    let participant = null;
    let isAdmin = false;

    if (isGroup) {
      try {
        metadata = await conn.groupMetadata(chatId);
        participant = metadata.participants.find(p => p.id === senderId);
        isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
      } catch (e) {}
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
      text: `📅 \`SHOWDATE\` 🔔\n\n\`\`\`Próximo ${fechaTexto}\`\`\`\n\`\`\`Hora exacta: ${horaTexto} (hora CDMX)\`\`\`\n\`\`\`Quedan, ${diasRestantes} días.\`\`\``
    }, { quoted: msg });
  }

  // =========================
  // COMANDO: .renovar
  // =========================
  if (commandText.startsWith(".renovar")) {
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

  // =========================
  // COMANDO: .afk <tiempo> <grupo>
  // =========================
  if (commandText.startsWith(".afk")) {
    if (!isOwner) return conn.sendMessage(chatId, { text: "🚫 *Solo el owner puede usar este comando.*" }, { quoted: msg });

    const tiempoTexto = args.slice(0, -1).join(" ");
    const grupoCode = args[args.length - 1];

    const grupo = global.gruposAdmin.find(g => g.code === grupoCode);
    if (!grupo) {
      return conn.sendMessage(chatId, {
        text: `❌ Grupo no encontrado. Usa *.listgrupos* para ver los disponibles.`
      }, { quoted: msg });
    }

    const tiempoMs = 1000 * 60 * 60 * 24; // 1 día por defecto
    const hasta = Date.now() + tiempoMs;

    global.gruposAfk[grupo.id] = hasta;
    fs.writeFileSync(afkPath, JSON.stringify(global.gruposAfk, null, 2));

    await conn.sendMessage(grupo.id, {
      text:
        `⚠️ *BOT EN MODO AFK*\n\n` +
        `🕒 Tiempo: ${tiempoTexto}\n` +
        `💬 Motivo: El servicio está suspendido por falta de pago.\n` +
        `💳 Contacta al owner para reactivarlo.`
    });

    return conn.sendMessage(chatId, {
      text: `✅ Grupo *${grupo.name}* fue puesto en modo AFK.`
    }, { quoted: msg });
  }

  // =========================
  // COMANDO: .activar <grupo>
  // =========================
  if (commandText.startsWith(".activar")) {
    if (!isOwner) return conn.sendMessage(chatId, { text: "🚫 *Solo el owner puede usar este comando.*" }, { quoted: msg });

    const grupoCode = args[0];
    const grupo = global.gruposAdmin.find(g => g.code === grupoCode);
    if (!grupo) {
      return conn.sendMessage(chatId, { text: `❌ Grupo no encontrado.` }, { quoted: msg });
    }

    delete global.gruposAfk[grupo.id];
    fs.writeFileSync(afkPath, JSON.stringify(global.gruposAfk, null, 2));

    await conn.sendMessage(grupo.id, {
      text: `✅ *BOT REACTIVADO*\n\nEl servicio ha sido restaurado correctamente.`
    });

    return conn.sendMessage(chatId, {
      text: `✅ Grupo *${grupo.name}* fue reactivado.`
    }, { quoted: msg });
  }
};

handler.command = ["tiempos", "verfecha", "renovar", "afk", "activar"];
handler.tags = ["tools"];
handler.help = [".tiempos <días> [grupo]", ".verfecha", ".renovar", ".afk <tiempo> <grupo>", ".activar <grupo>"];

module.exports = handler;