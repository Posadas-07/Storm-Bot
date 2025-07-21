const handler = async (msg, { conn }) => {
  const senderNum = msg.key.participant || msg.key.remoteJid;
  if (!global.owner.some(([id]) => id === senderNum.split('@')[0])) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: '❌ Solo el *owner* puede usar este comando.',
      quoted: msg
    });
  }

  const chatId = msg.key.remoteJid;

  // Lista de URLs de videos animados (tipo GIF)
  const videos = [
    'https://cdn.russellxz.click/66a899ac.mp4',
    'https://cdn.russellxz.click/be669722.mp4'
  ];

  // Selecciona una URL aleatoriamente
  const mediaUrl = videos[Math.floor(Math.random() * videos.length)];

  // Texto final del mensaje
  const message = `
🌅 *El owner ha despertado...*

⚔️ Luego de un descanso sagrado, el gran *admin supremo* ha regresado.

🧠 Comandos afilados, energía recargada y una taza de café virtual en mano...

🔧 ¡Storms-Bot vuelve a la acción!

👑 *Prepárense, que el jefe está de vuelta.*
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

handler.command = ["despertarowner"];
module.exports = handler;