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
        name: "𝖠𝖭𝖳𝖨𝖣𝖤𝖫𝖤𝖳𝖤",
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
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
    }, { quoted: fkontak });
  }

  const metadata = await conn.groupMetadata(chatId);
  const participante = metadata.participants.find(p => p.id === senderId);
  const isAdmin = participante?.admin === "admin" || participante?.admin === "superadmin";

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 Solo los administradores del grupo, el owner del bot o el mismo bot pueden usar este comando."
    }, { quoted: fkontak });
  }

  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    return conn.sendMessage(chatId, {
      text: "⚙️ Usa: *antidelete on/off*"
    }, { quoted: fkontak });
  }

  const activosPath = path.resolve("activos.json");
  let activos = {};
  if (fs.existsSync(activosPath)) {
    activos = JSON.parse(fs.readFileSync(activosPath, "utf-8"));
  }

  if (!activos.antidelete) activos.antidelete = {};

  let estado = args[0].toLowerCase() === "on";
  if (estado) {
    activos.antidelete[chatId] = true;
  } else {
    delete activos.antidelete[chatId];
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));

  const estadoTexto = estado ? "Activado" : "Desactivado";
  const mensaje = `\`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」\`\n\n` +
                  `*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈:* 𝖠𝗇𝗍𝗂𝖽𝖾𝗅𝖾𝗍𝖾\n` +
                  `*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈 :* ${estadoTexto}\n` +
                  `*│┊➺ 𝖯𝖺𝗋𝖺:* 𝖤𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈\n` +
                  `*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* ${estado ? "𝖠𝖼𝗍𝗂𝗏𝖺 𝗅𝖺 𝗋𝖾𝖼𝗎𝗉𝖾𝗋𝖺𝖼𝗂𝗈́𝗇 𝖽𝖾 𝗆𝖾𝗇𝗌𝖺𝗃𝖾𝗌 𝖾𝗅𝗂𝗆𝗂𝗇𝖺𝖽𝗈𝗌" : "𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺 𝗅𝖺 𝗋𝖾𝖼𝗎𝗉𝖾𝗋𝖺𝖼𝗂𝗈́𝗇 𝖽𝖾 𝗆𝖾𝗇𝗌𝖺𝗃𝖾𝗌"}\n` +
                  `*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*`;

  await conn.sendMessage(chatId, { text: mensaje }, { quoted: fkontak });

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["antidelete"];
module.exports = handler;