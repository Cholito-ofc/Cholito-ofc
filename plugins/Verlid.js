const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith('@g.us');

  if (!isGroup) {
    return await conn.sendMessage(chatId, {
      text: '❌ Este comando solo puede usarse en grupos.'
    }, { quoted: msg });
  }

  try {
    await conn.sendMessage(chatId, {
      react: { text: '🔍', key: msg.key }
    });

    const metadata = await conn.groupMetadata(chatId);
    const participantes = metadata.participants || [];

    const conLib = [];
    const sinLib = [];

    for (const p of participantes) {
      const jid = p.id || '';
      if (jid.endsWith('@s.whatsapp.net')) {
        const numero = jid.split('@')[0];
        conLib.push(`➤ +${numero}`);
      } else if (jid.endsWith('@lid')) {
        sinLib.push(`➤ ${jid}`);
      }
    }

    const mensaje = `
╭━〔 *📊 𝖤𝖲𝖳𝖠𝖣𝖮 𝖣𝖤 𝖵𝖨𝖲𝖨𝖡𝖨𝖫𝖨𝖣𝖠𝖣* 〕━╮
┃ 👥 *𝖬𝗂𝖾𝗆𝖻𝗋𝗈𝗌 𝗍𝗈𝗍𝖺𝗅𝖾𝗌:* ${participantes.length}
┃ 
┃ ✅ *𝖵𝗂𝗌𝗂𝖻𝗅𝖾𝗌 (+𝖭𝗎́𝗆𝖾𝗋𝗈):* ${conLib.length}
┃ ${conLib.length ? conLib.join('\n┃ ') : '┃ ➤ Ninguno'}
┃ 
┃ ❌ *𝖮𝖼𝗎𝗅𝗍𝗈𝗌 (𝖨𝖣 - 𝖫𝖨𝖣):* ${sinLib.length}
┃ ${sinLib.length ? sinLib.join('\n┃ ') : '┃ ➤ 𝖭𝗂𝗇𝗀𝗎𝗇𝗈'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

📌 *Nota:* 𝖶𝗁𝖺𝗍𝗌𝖺𝗉𝗉 𝗈𝖼𝗎𝗅𝗍𝖺 𝖺𝗅𝗀𝗎𝗇𝗈𝗌 𝗇𝗎́𝗆𝖾𝗋𝗈𝗌 𝗉𝗈𝗋 𝖯𝗋𝗂𝗏𝖺𝖼𝗂𝖽𝖺𝖽 𝗎𝗌𝖺́𝗇𝖽𝗈 𝖾́𝗅 𝖿𝗈𝗋𝗆𝖺𝗍𝗈 *@lid*.
`;

    await conn.sendMessage(chatId, {
      text: mensaje.trim()
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Error en verlib:", err);
    await conn.sendMessage(chatId, {
      text: '❌ Ocurrió un error al obtener la información del grupo.'
    }, { quoted: msg });
  }
};

handler.command = ['verlid'];
module.exports = handler;