const fs = require("fs");
const filePath = "./pruebas_grupo.json";
const TIEMPO_PREDETERMINADO = 30;

function cargarPruebas() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function guardarPruebas(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ACTIVADOR DEL MODO PRUEBA
const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo el dueño del bot puede activar o extender el modo prueba.*"
    }, { quoted: msg });
  }

  const minutos = parseInt(args[0]) || TIEMPO_PREDETERMINADO;
  if (minutos < 1 || minutos > 1440) {
    return conn.sendMessage(chatId, {
      text: "⏳ *El tiempo debe ser entre 1 y 1440 minutos.* \n\nEjemplo: *.pruebagrupo 45*"
    }, { quoted: msg });
  }

  let pruebas = cargarPruebas();
  pruebas[chatId] = {
    fin: Date.now() + minutos * 60 * 1000,
    minutos
  };
  guardarPruebas(pruebas);

  // Obtener el nombre del grupo
  let nombreGrupo = await conn.getName(chatId).catch(_ => "GRUPO DESCONOCIDO");
  let fecha = new Date().toLocaleString('es-ES', { hour12: false });

  let mensajePersonalizado = 
`➤ \`ORDENES RECIBIDAS\` ✅

\`\`\`Finaliza en: ${minutos} minuto${minutos === 1 ? '' : 's'}.\`\`\`
\`\`\`Fecha: ${fecha}.\`\`\`
\`\`\`Grupo: ${nombreGrupo}\`\`\`
`;

  await conn.sendMessage(chatId, {
    text: mensajePersonalizado
  }, { quoted: msg });

  setTimeout(async () => {
    let updatedData = cargarPruebas();
    if (updatedData[chatId] && Date.now() > updatedData[chatId].fin) {
      let ownerNumber = Array.isArray(global.owner) && global.owner[0] ? global.owner[0][0] : "";
      let ownerMsg = ownerNumber ? `\n\`\`\`Contacto del Owner: wa.me/${ownerNumber}\`\`\`` : "";

      let nombreGrupoFin = await conn.getName(chatId).catch(_ => "GRUPO DESCONOCIDO");
      let fechaFin = new Date().toLocaleString('es-ES', { hour12: false });

      let mensajeFin = 
`➤ \`PRUEBA FINALIZADA\` ❌

\`\`\`La prueba ha terminado.\`\`\`
\`\`\`Fecha: ${fechaFin}.\`\`\`
\`\`\`Grupo: ${nombreGrupoFin}\`\`\`${ownerMsg}

¿Quieres más tiempo o adquirir el bot de forma permanente? ¡Contáctanos!
`;
      await conn.sendMessage(chatId, { text: mensajeFin });
      delete updatedData[chatId];
      guardarPruebas(updatedData);
    }
  }, minutos * 60 * 1000);
};

handler.command = ["pruebagrupo"];
module.exports = handler;

// MIDDLEWARE: BLOQUEO TOTAL SI NO HAY PRUEBA ACTIVA (SALVO OWNER Y ACTIVADOR)
handler.before = async (msg, { conn, isCmd }) => {
  if (!msg.key.remoteJid.endsWith('@g.us')) return;

  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  // El owner siempre puede usar el bot:
  if (isOwner) return false;

  // Permitir siempre comandos
  if (isCmd) return false;

  // Permitir TODO si hay prueba activa:
  let pruebas = cargarPruebas();
  const prueba = pruebas[chatId];
  if (prueba && Date.now() <= prueba.fin) return false; // Si hay prueba activa, NO bloquees nada.

  // Si NO hay prueba activa, bloquea a todos menos owner y comandos.
  return true; // Bloquea el mensaje (no responde)
};