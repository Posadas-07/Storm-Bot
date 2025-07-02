const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  const videoUrl = "https://cdn.russellxz.click/c342f45f.mp4"; // 🎥 Video con sonido

  await conn.sendMessage(chatId, {
    video: { url: videoUrl },
    caption: "🎥 AQUÍ TIENES EL VIDEO..."
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "💔", key: msg.key }
  });
};

handler.command = ["spino"];
module.exports = handler;