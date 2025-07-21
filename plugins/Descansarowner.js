const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Lista de URLs de videos animados (tipo GIF)
  const videos = [
    'https://cdn.russellxz.click/48c364c7.mp4',
    'https://cdn.russellxz.click/02057ae4.mp4'
  ];

  // Selecciona una URL aleatoriamente
  const mediaUrl = videos[Math.floor(Math.random() * videos.length)];

  // Texto final del mensaje
  const message = `
🌃 *El owner se retira a descansar...*

✨ Después de un día lleno de comandos, trabajo y memes, es hora de que el gran *owner* se tome un merecido descanso.

🛌 Que sueñes con bots sin errores, grupos sin spam y bases de datos sin bugs.

💤 *Buenas noches a todos* — El *admin supremo* se va a dormir.

👑 *Storms-Bot* queda en modo silencioso hasta nuevo aviso.
`.trim();

  // Enviar el video como GIF animado con el mensaje
  await conn.sendMessage(chatId, {
    video: { url: mediaUrl },
    gifPlayback: true,
    caption: message
  }, { quoted: msg });

  // Reacción para confirmar envío
  await conn.sendMessage(chatId, {
    react: { text: "🌙", key: msg.key }
  });
};

handler.command = ["descansarowner"];
module.exports = handler;