const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const reportMsg = args.join(" ").trim();

  if (!reportMsg) {
    await conn.sendMessage(chatId, {
      text: "❌ *Indica el mensaje de error o reporte, ejemplo:*\n.reportar El bot no responde los comandos.",
      quoted: msg
    });
    return;
  }

  // Obtener el número real, sin sufijos, por ejemplo: 50489115621
  let senderId = msg.key.participant || msg.key.remoteJid;
  let senderNum = "";
  if (typeof senderId === "string") {
    senderNum = senderId.split("@")[0].replace(/\D/g, "");
  }

  // Formatear el número en formato internacional bonito
  // Puedes ajustar el formato según tu país (aquí ejemplo para +504 8911-5621)
  function formatPhone(num) {
    // Si el número tiene 12 dígitos, asume formato internacional (ej: 50489115621)
    if (num.length >= 11) {
      const pais = "+" + num.slice(0, num.length - 8);
      const parte1 = num.slice(-8, -4);
      const parte2 = num.slice(-4);
      return `${pais} ${parte1}-${parte2}`;
    } else if (num.length === 10) {
      // Ejemplo para México
      const pais = "+52";
      const parte1 = num.slice(0, 4);
      const parte2 = num.slice(4, 8);
      const parte3 = num.slice(8);
      return `${pais} ${parte1}-${parte2}-${parte3}`;
    }
    return "+" + num;
  }

  let senderName = msg.pushName || "Sin nombre";
  let groupName = "";
  if (isGroup) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      groupName = metadata.subject || "";
    } catch (e) {}
  }

  // Fecha y hora
  const now = new Date();
  const fechaHora = now.toLocaleString("es-MX", { timeZone: "America/Mexico_City" });

  // Solo envía al owner principal
  const [ownerNum] = global.owner;
  const ownerJid = ownerNum.includes("@s.whatsapp.net") ? ownerNum : ownerNum + "@s.whatsapp.net";

  let text = `*🚨 NUEVO REPORTE AL BOT 🚨*\n\n`;
  text += `*Fecha y hora:* ${fechaHora}\n\n`;
  text += `*Número:* ${formatPhone(senderNum)}\n\n`;
  text += `*Nombre:* ${senderName}\n\n`;
  if (isGroup) {
    text += `*Grupo:* ${groupName}\n`;
    text += `*ID Grupo:* ${chatId}\n\n`;
  } else {
    text += `*Chat privado*\n\n`;
  }
  text += `*Mensaje del reporte:*\n${reportMsg}\n`;

  await conn.sendMessage(ownerJid, { text });

  // Responde al usuario confirmando el envío
  await conn.sendMessage(chatId, {
    text: "✅ *¡Reporte enviado al owner!*\nGracias por tu ayuda. El owner revisará tu reporte lo antes posible.",
    quoted: msg
  });
};

handler.command = ["reportar"];
handler.tags = ["info"];
handler.help = ["reportar <mensaje>"];
module.exports = handler;