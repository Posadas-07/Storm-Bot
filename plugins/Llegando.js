const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];

  // 🔐 Verificar si es owner
  const isOwner = Array.isArray(global.owner) && global.owner.some(([id]) => id === senderNum);
  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Este comando solo puede usarlo el dueño del bot.*"
    }, { quoted: msg });
  }

  const videoUrl = "https://cdn.russellxz.click/91780b55.mp4"; // 🎥 Tu video con audio

  await conn.sendMessage(chatId, {
    video: { url: videoUrl },
    caption: "🎥 HABRAN PASO YA LLEGUÉ..."
  }, { quoted: msg });

  await conn.sendMessage(chatId, {
    react: { text: "💔", key: msg.key }
  });
};

handler.command = ["llegando"];
module.exports = handler;