const fs = require("fs");
const path = require("path");
const horariosPath = path.resolve("./horarios_grupo.json");

// Función para comparar hora actual con la programada
function horaActualHHMM() {
    let now = new Date();
    // Si quieres hora local, quita el .toUTCString y usa .toLocaleTimeString()
    let hh = now.getHours().toString().padStart(2, "0");
    let mm = now.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
}

// Función para abrir/cerrar grupo
async function cambiarEstadoGrupo(conn, chatId, abrirGrupo) {
    try {
        await conn.groupSettingUpdate(chatId, abrirGrupo ? "not_announcement" : "announcement");
        await conn.sendMessage(chatId, {
            text: abrirGrupo
                ? "🔓 *El grupo ha sido ABIERTO automáticamente por horario programado!*"
                : "🔒 *El grupo ha sido CERRADO automáticamente por horario programado!*"
        });
    } catch (e) {
        // Error típico si el bot no es admin
    }
}

// Loop principal
function iniciarAutoHorario(conn) {
    setInterval(async () => {
        let horarios = {};
        try {
            if (fs.existsSync(horariosPath)) {
                horarios = JSON.parse(fs.readFileSync(horariosPath, "utf-8"));
            }
        } catch { return; }

        let actual = horaActualHHMM();

        for (const chatId in horarios) {
            let { abrir, cerrar } = horarios[chatId] || {};
            // Apertura
            if (abrir && abrir === actual)
                await cambiarEstadoGrupo(conn, chatId, true);
            // Cierre
            if (cerrar && cerrar === actual)
                await cambiarEstadoGrupo(conn, chatId, false);
        }
    }, 60 * 1000); // cada minuto
}

module.exports = { iniciarAutoHorario };