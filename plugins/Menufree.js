const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const prefix = global.prefix;

  try {
    // Reacción al comando
    await conn.sendMessage(chatId, { react: { text: "🎮", key: msg.key } });

    // Imagen del menú
    const imgUrl = 'https://cdn.russellxz.click/964add8b.jpeg';

    // Texto del menú rediseñado
    const texto = `🎮 *KILLUA BOT MENU FF*

🧾 𝐌𝐀𝐏𝐀𝐒 𝐃𝐄 𝐉𝐔𝐄𝐆𝐎  
📍 ➤ ${prefix}mapas

📃 𝐑𝐄𝐆𝐋𝐀𝐒 𝐃𝐄 𝐄𝐍𝐅𝐑𝐄𝐍𝐓𝐀𝐌𝐈𝐄𝐍𝐓𝐎  
📘 ➤ ${prefix}reglas  
🖊️ ➤ ${prefix}setreglas

⚔️ 𝐋𝐈𝐒𝐓𝐀 𝐕𝐄𝐑𝐒𝐔𝐒 𝐃𝐄 𝐂𝐋𝐀𝐍𝐄𝐒  
⚡ ➤ ${prefix}vs4  
⚡ ➤ ${prefix}vs6  
⚡ ➤ ${prefix}vs12  
⚡ ➤ ${prefix}vs16  
⚡ ➤ ${prefix}vs20  
⚡ ➤ ${prefix}vs24  
⚡ ➤ ${prefix}scrims
🏹 ➤ ${prefix}guerr

───────────────────
👨‍💻 *Desarrollado por:* 𝐂𝐡𝐨𝐥𝐨 𝐱𝐳 
🤖 *KilluaBot — Sección Free Fire*`;

    await conn.sendMessage(chatId, {
      image: { url: imgUrl },
      caption: texto
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Error en .menufree:", err);
    await conn.sendMessage(chatId, {
      text: "❌ No se pudo mostrar el menú."
    }, { quoted: msg });
  }
};

handler.command = ['menuff'];
module.exports = handler;
