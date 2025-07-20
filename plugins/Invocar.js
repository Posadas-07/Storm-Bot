const https = require("https");

const handler = async (msg, { conn, args }) => {
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
  const mentionedJid = context?.mentionedJid || [];

  let target = null;

  // Si responde a alguien
  if (context?.participant) {
    target = context.participant;
  }
  // Si hay mención en el mensaje
  else if (mentionedJid.length > 0) {
    target = mentionedJid[0];
  }
  // Si menciona por texto con @
  else if (args.length > 0) {
    const mention = args.find(arg => arg.startsWith("@") && /^\@\d{5,}$/.test(arg));
    if (mention) {
      const num = mention.replace("@", "");
      target = num + "@s.whatsapp.net";
    }
  }

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Debes responder al mensaje o mencionar al usuario con @.\nEjemplo: .invocar @521234567890"
    }, { quoted: msg });
  }

  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.owner.some(([id]) => id === targetNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ No puedes invocar al dueño del bot."
    }, { quoted: msg });
  }

  // Descargar imagen
  const urlImagen = "https://cdn.russellxz.click/5cd1e264.jpeg";
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

handler.command = ["invocar"];
module.exports = handler;