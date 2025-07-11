import * as cheerio from "cheerio";
import { fetch } from "undici";
import { lookup } from "mime-types";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🧩 *ACCIÓN INCORRECTA*\n\n📌 Usa el comando con un enlace válido de *MediaFire*.\n\n🎯 *Ejemplo:* \n${usedPrefix + command} https://www.mediafire.com/file/archivo.zip`);
  }

  await m.react('🕒');

  try {
    const mf = await mediafire(text);

    let caption = `
┏━━━⟪ 𝗠𝗘𝗗𝗜𝗔𝗙𝗜𝗥𝗘 𝗗𝗘𝗧𝗘𝗖𝗧𝗔𝗗𝗢 ⟫━━━┓
┃📁 *Nombre:* ${mf.filename}
┃🧷 *Tipo:* ${mf.ext.toUpperCase()}
┃📦 *Tamaño:* ${mf.size}
┃📄 *MIME:* ${mf.mimetype}
┃📆 *Subido:* ${mf.uploadDate}
┗━━━━━━━━━━━━━━━━━━━┛
`.trim();

    await conn.sendMessage(m.chat, {
      document: { url: mf.download },
      fileName: mf.filename,
      mimetype: mf.mimetype,
      caption
    }, { quoted: m });

    await m.react('✅');
  } catch (error) {
    console.error(error);
    await m.react('❌');
    m.reply('❌ *Error al procesar el enlace de MediaFire.*\nPuede que el enlace esté caído o no sea válido.');
  }
};

handler.command = ['mf', 'mediafire', 'mfdl'];
handler.register = true;
handler.diamond = false;
handler.premium = false;
export default handler;