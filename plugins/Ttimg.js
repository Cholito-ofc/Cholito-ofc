const axios = require('axios');
const cheerio = require('cheerio');

const handler = async (m, { conn, text, command }) => {
    const emoji = '📸';
    const emoji2 = '❌';
    const fake = { quoted: m };

    if (!text) {
        return await conn.sendMessage(m.chat, { text: `${emoji} Ingresa el enlace del TikTok que contiene imágenes.` }, { quoted: m });
    }

    const creator = 'KilluaBot';
    const mainUrl = `https://dlpanda.com/id?url=${text}&token=G7eRpMaa`;
    const backupUrl = `https://dlpanda.com/id?url=${text}&token51=G32254GLM09MN89Maa`;

    const obtenerImagenes = async (url) => {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'text/html',
            }
        });
        const $ = cheerio.load(res.data);
        let imagenes = [];
        $('div.col-md-12 > img').each((_, el) => {
            const src = $(el).attr('src');
            if (src) imagenes.push(src);
        });
        return imagenes;
    };

    try {
        if (typeof m.react === 'function') await m.react('🔍');

        let imagenes = await obtenerImagenes(mainUrl);
        if (imagenes.length === 0) {
            imagenes = await obtenerImagenes(backupUrl);
        }

        if (imagenes.length === 0) {
            return await conn.sendMessage(m.chat, { text: `${emoji2} No se encontraron imágenes en el enlace proporcionado.` }, { quoted: m });
        }

        if (typeof m.react === 'function') await m.react('🕓');

        for (let img of imagenes) {
            try {
                await conn.sendFile(m.chat, img, '', `🖼️ Imagen descargada por *${creator}*.`, m, null, fake);
                if (typeof m.react === 'function') await m.react('✅');
            } catch (err) {
                console.error('Error enviando imagen:', err);
                if (typeof m.react === 'function') await m.react('✖️');
            }
        }
    } catch (err) {
        console.error('Error general:', err);
        await conn.sendMessage(m.chat, { text: `${emoji2} Ocurrió un error al intentar procesar el enlace.` }, { quoted: m });
        if (typeof m.react === 'function') await m.react('✖️');
    }
};

handler.help = ['tiktokimg <url>'];
handler.tags = ['descargas'];
handler.command = ['tiktokimg', 'ttimg'];
handler.group = true;
handler.register = true;
handler.coin = 2;

module.exports = handler;