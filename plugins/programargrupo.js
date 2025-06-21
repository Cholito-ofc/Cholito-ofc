const fs = require("fs");
const path = require("path");
const horariosPath = path.resolve("./horarios_grupo.json");

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

    // Permisos
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

    // Parseo de argumentos
    const text = args.join(" ");
    let abrir = text.match(/abrir\s+(\d{1,2}:\d{2})/i);
    let cerrar = text.match(/cerrar\s+(\d{1,2}:\d{2})/i);

    if (!abrir && !cerrar) {
        return conn.sendMessage(chatId, {
            text: "❌ *Uso correcto:* programargrupo abrir HH:MM cerrar HH:MM\n_Ejemplo:_ .programargrupo abrir 08:00 cerrar 22:00",
            quoted: msg
        });
    }

    let data = cargarHorarios();
    if (!data[chatId]) data[chatId] = {};
    if (abrir) data[chatId].abrir = abrir[1];
    if (cerrar) data[chatId].cerrar = cerrar[1];

    guardarHorarios(data);

    await conn.sendMessage(chatId, {
        text: `✅ *Horarios programados:*\n${abrir ? `🟢 Abrir: ${abrir[1]}\n` : ""}${cerrar ? `🔴 Cerrar: ${cerrar[1]}\n` : ""}`,
        quoted: msg
    });
};

handler.command = ["programargrupo"];
handler.tags = ["group"];
handler.help = ["programargrupo abrir HH:MM cerrar HH:MM"];
module.exports = handler;