const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isFromMe = msg.key.fromMe;
  const isOwner = global.owner.some(([id]) => id === senderClean);

  // fkontak estilo Izumi
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "𝗗𝗘𝗦𝗣𝗘𝗗𝗜𝗗𝗔𝗦",
        jpegThumbnail: await (await fetch("https://iili.io/FCJSFix.jpg")).buffer(),
        vcard:
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          "N:;Unlimited;;;\n" +
          "FN:Unlimited\n" +
          "ORG:Unlimited\n" +
          "TITLE:\n" +
          "item1.TEL;waid=19709001746:+1 (970) 900-1746\n" +
          "item1.X-ABLabel:Unlimited\n" +
          "X-WA-BIZ-DESCRIPTION:ofc\n" +
          "X-WA-BIZ-NAME:Unlimited\n" +
          "END:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  };

  if (!isGroup) {
    await conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
    }, { quoted: fkontak });
    return;
  }

  const metadata = await conn.groupMetadata(chatId);
  const participante = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participante?.admin === "admin" || participante?.admin === "superadmin";

  if (!isAdmin && !isOwner && !isFromMe) {
    await conn.sendMessage(chatId, {
      text: "🚫 Solo los administradores, el owner del bot o el mismo bot pueden usar este comando."
    }, { quoted: fkontak });
    return;
  }

  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    await conn.sendMessage(chatId, {
      text: `⚙️ Usa: *${global.prefix}despedidas on/off* para activar o desactivar los mensajes de despedida.`
    }, { quoted: fkontak });
    return;
  }

  const activosPath = path.resolve("activos.json");
  let activos = {};
  if (fs.existsSync(activosPath)) {
    activos = JSON.parse(fs.readFileSync(activosPath, "utf-8"));
  }

  if (!activos.despedidas) activos.despedidas = {};

  const estado = args[0].toLowerCase() === "on";
  if (estado) {
    activos.despedidas[chatId] = true;
  } else {
    delete activos.despedidas[chatId];
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));

  const estadoTexto = estado ? "Activado" : "Desactivado";
  const funcionTexto = estado
    ? "Enviar mensaje cuando alguien salga del grupo"
    : "No enviar mensaje cuando alguien salga";

  const mensaje = `\`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」\`\n\n` +
                  `*│┊➺ Comando:* Despedidas\n` +
                  `*│┊➺ Estado:* ${estadoTexto}\n` +
                  `*│┊➺ Para:* Este grupo\n` +
                  `*│┊➺ Función:* ${funcionTexto}\n` +
                  `*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*`;

  await conn.sendMessage(chatId, {
    text: mensaje
  }, { quoted: fkontak });

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["despedidas"];
module.exports = handler;