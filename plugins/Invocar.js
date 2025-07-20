// plugins/invocar.js
const https = require("https");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner.some(([id]) => id === senderNum);
  const isFromMe = msg.key.fromMe;

  if (!isOwner && !isFromMe) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Este comando solo puede usarlo el owner.*"
    }, { quoted: msg });
  }

  const texto = args.join(" ").trim();
  const mentionRegex = /@(\d{5,})/;
  const match = texto.match(mentionRegex);

  if (!match) {
    return conn.sendMessage(chatId, {
      text: "❌ *Debes mencionar a un usuario con @ para invocarlo.*\n\n_Ejemplo: .invocar @521XXXXXXXXXX_"
    }, { quoted: msg });
  }

  const numero = match[1] + "@s.whatsapp.net";
  const mencion = "@" + match[1];

  // Función para descargar la imagen desde URL
  const getImageBuffer = (url) => new Promise((resolve, reject) => {
    https.get(url, res => {
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });

  // Usamos imagen remota
  const imageBuffer = await getImageBuffer("https://i.imgur.com/Ez3DoO2.jpg");

  const textoFinal = `🌀 *𝗘𝗟 𝗢𝗪𝗡𝗘𝗥 𝗧𝗘 𝗛𝗔 𝗜𝗡𝗩𝗢𝗖𝗔𝗗𝗢* ${mencion}`;

  await conn.sendMessage(chatId, {
    image: imageBuffer,
    caption: textoFinal,
    mentions: [numero]
  }, { quoted: msg });
};

handler.command = ["invocar"];
handler.tags = ["owner"];
handler.help = ["invocar @usuario"];
module.exports = handler;