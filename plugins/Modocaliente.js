const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  // Contacto decorativo estilo Izumi
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "𝙈𝙤𝙙𝙤 𝘾𝙖𝙡𝙞𝙚𝙣𝙩𝙚",
        jpegThumbnail: await (await fetch('https://iili.io/FCJSFix.jpg')).buffer(),
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
  const isOwner = global.owner.some(([id]) => id === senderClean);
  const isFromMe = msg.key.fromMe;

  if (!isAdmin && !isOwner && !isFromMe) {
    await conn.sendMessage(chatId, {
      text: "🚫 Solo los administradores del grupo, el owner o el bot pueden usar este comando."
    }, { quoted: fkontak });
    return;
  }

  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    await conn.sendMessage(chatId, {
      text: "⚙️ Usa: *modocaliente on/off* para activar o desactivar el modo caliente en este grupo."
    }, { quoted: fkontak });
    return;
  }

  const activosPath = path.resolve("activos.json");
  let activos = {};
  if (fs.existsSync(activosPath)) {
    activos = JSON.parse(fs.readFileSync(activosPath, "utf-8"));
  }

  if (!activos.modocaliente) activos.modocaliente = {};

  if (args[0].toLowerCase() === "on") {
    activos.modocaliente[chatId] = true;
    await conn.sendMessage(chatId, {
      text: `🔥 *MODO CALIENTE ACTIVADO* 🔥\n\nDesde ahora este grupo tiene acceso a los comandos +18 😈\n\nDisfruten con responsabilidad, degenerados.`
    }, { quoted: fkontak });
  } else {
    delete activos.modocaliente[chatId];
    await conn.sendMessage(chatId, {
      text: `🧯 *MODO CALIENTE DESACTIVADO* 🧯\n\nLos comandos +18 ya no están disponibles en este grupo.\n\nModo fresas activado 🍓`
    }, { quoted: fkontak });
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));

  // Reacción al comando
  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["modocaliente"];
module.exports = handler;