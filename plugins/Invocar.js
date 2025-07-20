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

  // Intentamos obtener usuario citado primero
  const context = msg.message?.extendedTextMessage?.contextInfo;
  let target = context?.participant;

  // Si no hay usuario citado, buscamos mención en args
  if (!target) {
    if (args.length === 0) {
      return conn.sendMessage(chatId, {
        text: "⚠️ Responde al mensaje o menciona al usuario que quieres invocar.\nEjemplo: .invocar @521234567890"
      }, { quoted: msg });
    }

    const mention = args.find(arg => arg.startsWith("@") && /^\@\d{5,}$/.test(arg));
    if (!mention) {
      return conn.sendMessage(chatId, {
        text: "⚠️ Debes mencionar al usuario con @ seguido del número.\nEjemplo: .invocar @521234567890"
      }, { quoted: msg });
    }

    const num = mention.replace("@", "");
    target = num + "@s.whatsapp.net"; // Aquí aseguramos JID correcto
  }

  // No invocar al owner
  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.owner.some(([id]) => id === targetNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ No puedes invocar al dueño del bot."
    }, { quoted: msg });
  }

  // Descargar imagen
  const urlImagen = "https://cdn.russellxz.click/7ec1b6ec.jpeg"; // Cambia la URL si quieres
  const getImageBuffer = (url) => new Promise((resolve, reject) => {
    https.get(url, res => {
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });

  const imageBuffer = await getImageBuffer(urlImagen);

  // Texto con mención real
  const textoFinal = `🌀 *𝗘𝗟 𝗢𝗪𝗡𝗘𝗥 𝗧𝗘 𝗛𝗔 𝗜𝗡𝗩𝗢𝗖𝗔𝗗𝗢* @${target.split("@")[0]}`;

  await conn.sendMessage(chatId, {
    image: imageBuffer,
    caption: textoFinal,
    mentions: [target]
  }, { quoted: msg });
};

handler.command = ["invocar"];
module.exports = handler;