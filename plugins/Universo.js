const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const videoUrl = "https://cdn.russellxz.click/59bb9a1d.mp4"; // 🎥 Video con sonido

  await conn.sendMessage(chatId, {
    video: { url: videoUrl },
    caption: "🎥 ALPHA..."
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "💔", key: msg.key }
  });
};

handler.command = ["universo"];
module.exports = handler;