const https = require("https");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo el owner puede usar este comando."
    }, { quoted: msg });
  }

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant;

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Responde al mensaje del usuario que quieres invocar."
    }, { quoted: msg });
  }

  // No invocar al owner
  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.owner.some(([id]) => id === targetNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ No puedes invocar al dueño del bot."
    }, { quoted: msg });
  }

  // Descarga imagen
  const urlImagen = "https://cdn.russellxz.click/082e7467.jpeg";
  const getImageBuffer = (url) => new Promise((resolve, reject) => {
    https.get(url, res => {
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });

  const imageBuffer = await getImageBuffer(urlImagen);

  const textoFinal = `🌀 *𝗘𝗟 𝗢𝗪𝗡𝗘𝗥 𝗧𝗘 𝗛𝗔 𝗜𝗡𝗩𝗢𝗖𝗔𝗗𝗢* @${target.split("@")[0]}`;

  await conn.sendMessage(chatId, {
    image: imageBuffer,
    caption: textoFinal,
    mentions: [target]
  }, { quoted: msg });
};

handler.command = ["inv"];
module.exports = handler;