const { writeFileSync, unlinkSync, existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const axios = require('axios');
const sharp = require('sharp');

module.exports = {
  name: 'gay',
  alias: ['gay'],
  description: 'Aplica efecto gay a la foto de perfil',
  category: 'diversión',
  use: '@usuario o responde a un mensaje',
  async run(msg, { conn }) {
    const { quoted, mentionedJid, sender, isGroup } = msg;
    const target = mentionedJid?.[0] || (quoted?.participant || quoted?.sender) || (isGroup ? sender : msg.key.remoteJid);

    if (!target) return msg.reply('🚫 Debes responder o etiquetar a alguien.');

    try {
      const ppUrl = await conn.profilePictureUrl(target, 'image').catch(() => null);
      if (!ppUrl) return msg.reply('❌ No se pudo obtener la foto de perfil.');

      const profilePic = (await axios.get(ppUrl, { responseType: 'arraybuffer' })).data;
      const overlayPath = join(__dirname, '../media/rainbow.png');

      if (!existsSync(overlayPath)) return msg.reply('⚠️ Falta el archivo rainbow.png en la carpeta /media.');

      const overlay = await sharp(overlayPath).resize(512, 512).png().toBuffer();

      const finalImage = await sharp(profilePic)
        .resize(512, 512)
        .composite([{ input: overlay, blend: 'overlay' }])
        .png()
        .toBuffer();

      // Crear carpeta tmp si no existe
      const tmpDir = join(__dirname, '../tmp');
      if (!existsSync(tmpDir)) mkdirSync(tmpDir);

      const outFile = join(tmpDir, `gay-${Date.now()}.png`);
      writeFileSync(outFile, finalImage);

      await conn.sendMessage(msg.chat, {
        image: { url: outFile },
        caption: `🏳️‍🌈 *@${target.split('@')[0]} es 100% GAY confirmado por el radar gay 🌈*\n😍✨ #Pride #Fabuloso`,
        mentions: [target]
      });

      unlinkSync(outFile);
    } catch (err) {
      console.error(err);
      msg.reply('⚠️ Ocurrió un error al procesar la imagen.');
    }
  }
};