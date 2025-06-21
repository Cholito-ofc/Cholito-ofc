const fs = require("fs");
const path = require("path");
const horariosPath = path.resolve("./horarios_grupo.json");
const zonas = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Lima",
  "America/Argentina/Buenos_Aires"
];

function convertirHora(horaStr) {
    const match = horaStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (!match) return null;
    let [_, h, m, ap] = match;
    h = parseInt(h);
    m = m.padStart(2, "0");
    ap = ap.toLowerCase();
    if (ap === "pm" && h !== 12) h += 12;
    if (ap === "am" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m}`;
}

function cargarHorarios() {
    if (!fs.existsSync(horariosPath)) return {};
    return JSON.parse(fs.readFileSync(horariosPath, "utf-8"));
}

function guardarHorarios(data) {
    fs.writeFileSync(horariosPath, JSON.stringify(data, null, 2));
}

const handler = async (msg, { conn, args }) => {
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");
    const senderId = msg.key.participant || msg.key.remoteJid;
    const senderNum = senderId.replace(/[^0-9]/g, "");
    const isOwner = global.owner.some(([id]) => id === senderNum);
    const isFromMe = msg.key.fromMe;

    if (isGroup && !isOwner && !isFromMe) {
        const metadata = await conn.groupMetadata(chatId);
        const participant = metadata.participants.find(p => p.id === senderId);
        const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
        if (!isAdmin) {
            return conn.sendMessage(chatId, { text: "🚫 *Solo admins, owner o bot pueden usar este comando.*" }, { quoted: msg });
        }
    } else if (!isGroup && !isOwner && !isFromMe) {
        return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando en privado.*" }, { quoted: msg });
    }

    // Permitir cambiar zona horaria: .programargrupo zona America/Mexico_City
    if (args[0] && args[0].toLowerCase() === "zona") {
        const zona = args[1];
        if (!zonas.includes(zona)) {
            return conn.sendMessage(chatId, {
                text: `❌ *Zona horaria no soportada.*\n*Soportadas:* ${zonas.map(z=>`\n• ${z}`).join("")}`,
                quoted: msg
            });
        }
        let data = cargarHorarios();
        if (!data[chatId]) data[chatId] = {};
        data[chatId].zona = zona;
        guardarHorarios(data);
        return conn.sendMessage(chatId, {
            text: `🌎 *Zona horaria del grupo configurada a:* _${zona}_`,
            quoted: msg
        });
    }

    // Parseo de argumentos: permite "abrir 8:30 am cerrar 10:45 pm"
    const text = args.join(" ");
    let abrir = text.match(/abrir\s+(\d{1,2}:\d{2}\s*(?:am|pm))/i);
    let cerrar = text.match(/cerrar\s+(\d{1,2}:\d{2}\s*(?:am|pm))/i);

    if (!abrir && !cerrar) {
        return conn.sendMessage(chatId, {
            text: `🌅 *Programación de grupo*\n\n` +
                  `*Uso correcto:*\n` +
                  `» .programargrupo abrir 8:00 am cerrar 10:30 pm\n` +
                  `» .programargrupo zona America/Mexico_City\n\n` +
                  `*Ejemplos:*\n` +
                  `• .programargrupo abrir 7:45 am\n` +
                  `• .programargrupo cerrar 11:15 pm\n` +
                  `• .programargrupo abrir 8:30 am cerrar 10:00 pm\n` +
                  `• .programargrupo zona America/Bogota\n\n` +
                  `⏰ *Puedes usar hora y minutos, y debes especificar am o pm.*\n` +
                  `🌎 *Zonas soportadas:* ${zonas.map(z=>`\n• ${z}`).join("")}`,
            quoted: msg
        });
    }

    let data = cargarHorarios();
    if (!data[chatId]) data[chatId] = {};
    let msgBonito = "🕑 *Nuevos horarios programados:*\n";

    if (abrir) {
        const hora24 = convertirHora(abrir[1]);
        if (!hora24) return conn.sendMessage(chatId, { text: "❌ *Formato de hora inválido para abrir.*\nEjemplo: 7:30 am", quoted: msg });
        data[chatId].abrir = hora24;
        msgBonito += `🌤️  Abrir grupo: *${abrir[1].toUpperCase()}* (${hora24})\n`;
    }
    if (cerrar) {
        const hora24 = convertirHora(cerrar[1]);
        if (!hora24) return conn.sendMessage(chatId, { text: "❌ *Formato de hora inválido para cerrar.*\nEjemplo: 11:15 pm", quoted: msg });
        data[chatId].cerrar = hora24;
        msgBonito += `🌙  Cerrar grupo: *${cerrar[1].toUpperCase()}* (${hora24})\n`;
    }

    if (!data[chatId].zona) data[chatId].zona = "America/Mexico_City"; // Default México

    guardarHorarios(data);

    msgBonito += `\n🌎 Zona horaria: *${data[chatId].zona}*`;
    msgBonito += "\n🔄 *El bot abrirá y cerrará el grupo automáticamente a esas horas!*";
    await conn.sendMessage(chatId, { text: msgBonito, quoted: msg });
};

handler.command = ["programargrupo"];
handler.tags = ["group"];
handler.help = ["programargrupo abrir HH:MM am/pm cerrar HH:MM am/pm", "programargrupo zona America/Mexico_City"];
module.exports = handler;