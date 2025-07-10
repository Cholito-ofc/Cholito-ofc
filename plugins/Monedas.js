const fetch = require('node-fetch');

const ALIASES = {
  dolar: ['USD', '$'], dólares: ['USD', '$'], usd: ['USD', '$'],
  euro: ['EUR', '€'], euros: ['EUR', '€'], eur: ['EUR', '€'],
  pesos: ['MXN', '$'], 'pesos colombianos': ['COP', '$'], cop: ['COP', '$']
};

function getCurrencyData(word = '') {
  word = word.toLowerCase().trim();
  return ALIASES[word] || [word.toUpperCase(), ''];
}

const handler = async (m, { conn }) => {
  console.log('[.monedas] Handler recibido');

  const chatId = m.chat;
  const text = m.text || '';

  if (!text.toLowerCase().startsWith('.monedas')) return;

  const match = text.match(/(\d+([.,]\d+)?)\s*(\w+(?:\s\w+)*)\s*(a|en)?\s*(.+)/i);
  if (!match) {
    console.log('[.monedas] Formato incorrecto');
    return conn.sendMessage(chatId, {
      text: '❗ Formato incorrecto. Ej: `.monedas 10 euros en pesos colombianos`'
    });
  }

  const amount = parseFloat(match[1].replace(',', '.'));
  const [fromCode, fromSymbol] = getCurrencyData(match[3]);
  const [toCode, toSymbol] = getCurrencyData(match[5]);

  console.log(`[.monedas] Parsed: ${amount} ${fromCode} -> ${toCode}`);

  try {
    const url = `https://api.exchangerate.host/convert?from=${fromCode}&to=${toCode}&amount=${amount}`;
    console.log('[.monedas] Fetching:', url);

    const res = await fetch(url);
    const data = await res.json();

    console.log('[.monedas] API response:', data);

    if (!data.success) {
      throw new Error('Conversión fallida');
    }

    const result = Number(data.result).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const updated = new Date(data.date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const reply =
      `💱 *${amount}* ${fromSymbol || ''}${fromCode} ≈ *${toSymbol || ''}${result}* ${toCode}\n` +
      `📅 Actualizado: *${updated}*\n✨ Generado por: *KilluaBot*`;

    await conn.sendMessage(chatId, { text: reply });

  } catch (err) {
    console.error('[.monedas] Error:', err);
    await conn.sendMessage(chatId, {
      text: '❗ No pude obtener la tasa. Asegúrate de escribir monedas válidas.'
    });
  }
};

handler.command = ['monedas'];
module.exports = handler;