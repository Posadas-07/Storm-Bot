const https = require("https");

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
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

  const num = match[1]; // número sin @ ni +
  const jid = num + "@s.whatsapp.net";

  // Función para descargar la imagen desde URL
  const getImageBuffer = (url) => new Promise((resolve, reject) => {
    https.get(url, res => {
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });

  const urlImagen = "https://cdn.russellxz.click/082e7467.jpeg"; // Cambia aquí tu URL

  const imageBuffer = await getImageBuffer(urlImagen);

  // Texto con mención real (solo número)
  const textoFinal = `🌀 *𝗘𝗟 𝗢𝗪𝗡𝗘𝗥 𝗧𝗘 𝗛𝗔 𝗜𝗡𝗩𝗢𝗖𝗔𝗗𝗢* @${jid.split("@")[0]}`;

  await conn.sendMessage(chatId, {
    image: imageBuffer,
    caption: textoFinal,
    mentions: [jid]
  }, { quoted: msg });
};

handler.command = ["inv"];
handler.tags = ["owner"];
handler.help = ["invocar @usuario"];
module.exports = handler;