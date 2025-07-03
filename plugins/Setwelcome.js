const fs = require('fs');
const path = require('path');

const handler = async (msg, { conn, text, usedPrefix }) => {
  const chatId = msg.key.remoteJid;

  if (!chatId.endsWith('@g.us')) {
    return conn.sendMessage(chatId, {
      text: 
`╭┈┈┈[ 🚫 *COMANDO INVÁLIDO* ]┈┈┈≫
┊ Este comando solo puede usarse en *grupos*.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
    }, { quoted: msg });
  }

  if (!text) {
    return conn.sendMessage(chatId, {
      text: 
`╭┈┈┈[ ✨ *EJEMPLO DE USO* ]┈┈┈≫
┊ Usa el comando así:
┊ 
┊ 📌 *${usedPrefix}setwelcome* Bienvenido al  grupo!
┊ 
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
    }, { quoted: msg });
  }

  // Obtener metadata y verificar permisos
  try {
    const metadata = await conn.groupMetadata(chatId);
    const senderId = msg.key.participant || msg.key.remoteJid;
    const senderClean = senderId.replace(/[^0-9]/g, '');
    const participant = metadata.participants.find(p => p.id.includes(senderClean));
    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    const isOwner = global.owner.some(([num]) => num === senderClean);

    if (!isAdmin && !isOwner) {
      return conn.sendMessage(chatId, {
        text: 
`╭┈┈┈[ ⚠️ *PERMISO DENEGADO* ]┈┈┈≫
┊ Solo los *admins del grupo* o el *owner del bot*
┊ pueden usar este comando.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
      }, { quoted: msg });
    }
  } catch (e) {
    console.error('Error al obtener metadata:', e);
    return conn.sendMessage(chatId, {
      text: 
`╭┈┈┈[ ❌ *ERROR DE GRUPO* ]┈┈┈≫
┊ No se pudo verificar si eres administrador.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: '⏳', key: msg.key }
  });

  // Guardar mensaje personalizado
  try {
    const filePath = path.resolve('./welcome.json');

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    }

    const welcomeData = JSON.parse(fs.readFileSync(filePath));
    welcomeData[chatId] = text;
    fs.writeFileSync(filePath, JSON.stringify(welcomeData, null, 2));

    await conn.sendMessage(chatId, {
      text: 
`╭┈┈┈[ ✅ *BIENVENIDA GUARDADA* ]┈┈┈≫
┊ El mensaje de bienvenida se guardó exitosamente:
┊ 
┊ 📝 *${text}*
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error('Error al guardar welcome.json:', err);

    await conn.sendMessage(chatId, {
      text: 
`╭┈┈┈[ ❌ *ERROR AL GUARDAR* ]┈┈┈≫
┊ Hubo un problema al guardar el mensaje.
┊ Intenta nuevamente más tarde.
╰┈┈┈┈┈┈┈┈┈┈┈┈┈≫`,
    }, { quoted: msg });

    await conn.sendMessage(chatId, {
      react: { text: '❌', key: msg.key }
    });
  }
};

handler.command = ['setwelcome'];
module.exports = handler;
