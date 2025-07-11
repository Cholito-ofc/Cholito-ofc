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
        name: "𝙈𝙤𝙙𝙤 𝙍𝙋𝙂 𝙆𝙞𝙡𝙡𝙪𝙖",
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
      text: "🚫 Este comando solo está disponible en *grupos*."
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
      text: "🛑 Solo *admins*, el *owner* o el *bot* pueden usar este comando."
    }, { quoted: fkontak });
    return;
  }

  if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
    await conn.sendMessage(chatId, {
      text: "🎮 *Modo RPG Killua*\n\nUsa:\n*#rpgkillua on* para activar\n*#rpgkillua off* para desactivar"
    }, { quoted: fkontak });
    return;
  }

  const activosPath = path.resolve("activos.json");
  let activos = {};
  if (fs.existsSync(activosPath)) {
    activos = JSON.parse(fs.readFileSync(activosPath, "utf-8"));
  }

  if (!activos.rpgkillua) activos.rpgkillua = {};

  const estado = args[0].toLowerCase();

  if (estado === "on") {
    activos.rpgkillua[chatId] = true;

    await conn.sendMessage(chatId, {
      text:
`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」

*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈:* 𝖬𝗈𝖽𝗈 𝖱𝖯𝖦 𝖪𝗂𝗅𝗅𝗎𝖺
*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈:* 𝖠𝖼𝗍𝗂𝗏𝖺𝖽𝗈 ✅
*│┊➺ 𝖯𝖺𝗋𝖺:* 𝖤𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈
*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* 𝖠𝖼𝗍𝗂𝗏𝖺 𝗅𝗈𝗌 𝖼𝗈𝗆𝖺𝗇𝖽𝗈𝗌 +𝟣𝟪
*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*`
    }, { quoted: fkontak });
  } else {
    delete activos.rpgkillua[chatId];

    await conn.sendMessage(chatId, {
      text:
`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」

*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈:* 𝖬𝗈𝖽𝗈 𝖱𝖯𝖦 𝖪𝗂𝗅𝗅𝗎𝖺
*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈:* 𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈 ❌
*│┊➺ 𝖯𝖺𝗋𝖺:* 𝖤𝗌𝗍𝖾 𝗀𝗋𝗎𝗉𝗈
*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* 𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺 𝗅𝗈𝗌 𝖼𝗈𝗆𝖺𝗇𝖽𝗈𝗌 +𝟣𝟪
*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*`
    }, { quoted: fkontak });
  }

  fs.writeFileSync(activosPath, JSON.stringify(activos, null, 2));

  await conn.sendMessage(chatId, {
    react: { text: "✅", key: msg.key }
  });
};

handler.command = ["rpgkillua"];
module.exports = handler;