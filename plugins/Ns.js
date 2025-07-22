const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const videoUrl = "https://cdn.russellxz.click/94283f9f.mp4"; // 🎥 Video con sonido

  await conn.sendMessage(chatId, {
    video: { url: videoUrl },
    caption: "🎥 NS..."
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "💔", key: msg.key }
  });
};

handler.command = ["ns"];
module.exports = handler;