const axios = require("axios");
const { proto, generateWAMessageContent, generateWAMessageFromContent } = require("@whiskeysockets/baileys");

const handler = async (msg, { conn, text, command }) => {
  const chatId = msg.key.remoteJid;

  if (!text) {
    return conn.sendMessage(chatId, {
      text: "🍭 *Ingresa el nombre o tema del video de TikTok que deseas buscar.*\n\n📌 Ejemplo:\n.tiktoksearch gatos graciosos"
    }, { quoted: msg });
  }

  const dev = "🤖 KilluaBot";
  const icons = null; // Aquí puedes usar un buffer de thumbnail si deseas
  const rdone = "✅"; // Emoji de reacción si usas message.react

  const createVideoMessage = async (url) => {
    const { videoMessage } = await generateWAMessageContent({ video: { url } }, {
      upload: conn.waUploadToServer
    });
    return videoMessage;
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  try {
    // Buscar en API
    const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
    let searchResults = response?.data;

    if (!searchResults || searchResults.length === 0) {
      return conn.sendMessage(chatId, {
        text: "😔 *No se encontraron resultados para tu búsqueda.*"
      }, { quoted: msg });
    }

    shuffleArray(searchResults);
    const selectedResults = searchResults.slice(0, 7);

    const results = [];

    for (const result of selectedResults) {
      results.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: dev }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: result.title,
          hasMediaAttachment: true,
          videoMessage: await createVideoMessage(result.nowm)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    const responseMessage = generateWAMessageFromContent(chatId, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ text: "🍭 *Resultados de búsqueda para:* " + text }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: "🍿 TikTok Search - KilluaBot" }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: results
            })
          })
        }
      }
    }, { quoted: msg });

    await conn.relayMessage(chatId, responseMessage.message, { messageId: responseMessage.key.id });

  } catch (err) {
    console.error(err);
    await conn.sendMessage(chatId, {
      text: "🚫 *Error al buscar en TikTok:*\n" + err.message
    }, { quoted: msg });
  }
};

handler.command = ["ttsearch", "tiktoks"];
handler.tags = ["buscador"];
handler.help = ["tiktoksearch <texto>"];
handler.register = true;

module.exports = handler;