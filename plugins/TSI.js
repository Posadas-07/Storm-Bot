const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const videoUrl = "https://cdn.russellxz.click/494b7b3d.mp4"; // 🎥 Video con sonido

  await conn.sendMessage(chatId, {
    video: { url: videoUrl },
    caption: "🎥 TSI..."
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "💔", key: msg.key }
  });
};

handler.command = ["tsi"];
module.exports = handler;