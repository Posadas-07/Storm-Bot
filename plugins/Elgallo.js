const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const videoUrl = "https://cdn.russellxz.click/8f63fcc6.mp4"; // 🎥 Video con sonido

  await conn.sendMessage(chatId, {
    video: { url: videoUrl },
    caption: "🎥 EL GALLO..."
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "💔", key: msg.key }
  });
};

handler.command = ["elgallo"];
module.exports = handler;