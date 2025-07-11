const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderClean = senderId.replace(/[^0-9]/g, "");

  // vCard decorativa
  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      locationMessage: {
        name: "𝗠𝗢𝗗𝗢 𝗔𝗡𝗧𝗜𝗣𝗢𝗥𝗡𝗢",
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

  if (!chatId.endsWith("@g.us")) {
    return await conn.sendMessage(chatId, {
      text: "❌ Este comando solo funciona en grupos."
    }, { quoted: fkontak });
  }

  try {
    const metadata = await conn.groupMetadata(chatId);
    const participant = metadata.participants.find(p => p.id.includes(senderClean));
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
    const isOwner = global.owner.some(o => o[0] === senderClean);

    if (!isAdmin && !isOwner) {
      return conn.sendMessage(chatId, {
        text: "❌ Solo los administradores o el owner pueden usar este comando."
      }, { quoted: fkontak });
    }

    if (!args[0] || !["on", "off"].includes(args[0])) {
      return conn.sendMessage(chatId, {
        text: "✳️ Usa el comando así:\n\n📌 *antiporno on*  (activar)\n📌 *antiporno off* (desactivar)"
      }, { quoted: fkontak });
    }

    await conn.sendMessage(chatId, {
      react: { text: "⏳", key: msg.key }
    });

    const filePath = path.resolve("./activos.json");
    let data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
    if (!data.antiporno) data.antiporno = {};

    const estado = args[0] === "on";
    if (estado) {
      data.antiporno[chatId] = true;
    } else {
      delete data.antiporno[chatId];
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    const estadoTexto = estado ? "𝖠𝖼𝗍𝗂𝗏𝖺𝖽𝗈" : "𝖣𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈";
    const funcionTexto = estado
      ? "𝖡𝗅𝗈𝗊𝗎𝖾𝖺𝗋 𝖼𝗈𝗇𝗍𝖾𝗇𝗂𝖽𝗈 𝗉𝖺𝗋𝖺 𝖺𝖽𝗎𝗅𝗍𝗈𝗌"
      : "𝖤𝗅 𝗌𝗂𝗌𝗍𝖾𝗆𝖺 𝗁𝖺 𝗌𝗂𝖽𝗈 𝖽𝖾𝗌𝖺𝖼𝗍𝗂𝗏𝖺𝖽𝗈";

    const mensaje = `\`「 𝖠𝖼𝖼𝗂𝗈́𝗇 𝗋𝖾𝖺𝗅𝗂𝗓𝖺𝖽𝖺 ✅ 」\`\n\n` +
                    `*│┊➺ 𝖢𝗈𝗆𝖺𝗇𝖽𝗈:* Antiporno\n` +
                    `*│┊➺ 𝖤𝗌𝗍𝖺𝖽𝗈:* ${estadoTexto}\n` +
                    `*│┊➺ 𝖯𝖺𝗋𝖺:* Este grupo\n` +
                    `*│┊➺ 𝖥𝗎𝗇𝖼𝗂𝗈́𝗇:* ${funcionTexto}\n` +
                    `*╰ ∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙∙ ∙ ∙ ∙ ∙*`;

    await conn.sendMessage(chatId, {
      text: mensaje,
      mentions: [senderId]
    }, { quoted: fkontak });

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en comando antiporno:", err);
    await conn.sendMessage(chatId, {
      text: "❌ Ocurrió un error al ejecutar el comando."
    }, { quoted: fkontak });

    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    });
  }
};

handler.command = ["antiporno"];
module.exports = handler;