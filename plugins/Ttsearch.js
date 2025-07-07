3. El usuario responde con un número (por ejemplo, `5`).

4. El bot envía **5 videos TikTok** (uno por uno, vertical, con descripción).

---

### ✅ Implementación estilo KilluaBot

Este comando se manejará en dos partes:

- `ttsearch`: hace la búsqueda y guarda los resultados temporalmente.
- Al responder con un número (1–10), el bot lee la respuesta, busca los resultados guardados y envía solo esa cantidad de videos.

---

### ✅ Código: `ttsearch.js`

```js
const axios = require("axios");

const tempTikTokSearch = {}; // Objeto temporal en memoria

const handler = async (msg, { conn, text }) => {
const chatId = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;

if (!text) {
 return conn.sendMessage(chatId, {
   text:
`🎯 *Búsqueda de Videos TikTok*

📌 *Usa el comando así:*
.ttsearch edits de Messi

💡 *KilluaBot buscará hasta 10 resultados para ti...*`
 }, { quoted: msg });
}

try {
 const { data: response } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`);
 let results = response?.data;

 if (!results || results.length === 0) {
   return conn.sendMessage(chatId, {
     text: "😔 *No se encontraron resultados para tu búsqueda.*"
   }, { quoted: msg });
 }

 results = results.slice(0, 10); // máximo 10

 // Guardar resultados temporalmente usando ID del usuario
 tempTikTokSearch[sender] = results;

 return conn.sendMessage(chatId, {
   text:
`🧠 *Se encontraron ${results.length} resultados para:* "${text}"

📥 *Responde con un número del 1 al ${results.length}* para recibir esa cantidad de videos.

🔢 *Ejemplo:* 5`
 }, { quoted: msg });

} catch (err) {
 console.error(err);
 return conn.sendMessage(chatId, {
   text: "❌ *Error al buscar en TikTok:*\n" + err.message
 }, { quoted: msg });
}
};

handler.command = ["ttsearch"];
handler.tags = ["buscador"];
handler.help = ["ttsearch <tema>"];
handler.register = true;

module.exports = handler;

// Exportamos los datos temporales para usarlos en el segundo handler
module.exports.tempTikTokSearch = tempTikTokSearch;