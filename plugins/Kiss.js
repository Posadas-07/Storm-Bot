const fs = require("fs");
const path = require("path");

// 🔧 Aquí pones tus GIFs de abrazos (pueden ser .mp4)
const gifUrls = [
  "https://cdn.russellxz.click/c6ea097b.mp4",
  "URL_DEL_GIF_2",
  "URL_DEL_GIF_3"
];

// Frases personalizadas de abrazos
const textos = [
  "🫂 *@1 abrazó tiernamente a @2* 💖",
  "💞 *@1 le dio un fuerte abrazo a @2* 🤗",
  "😍 *@1 se lanzó a abrazar a @2 sin pensarlo* 🤍",
  "😳 *@1 abrazó con fuerza a @2* 💕",
  "🤍 *@1 y @2 compartieron un cálido abrazo* 🫂",
  "🌙 *@1 abrazó a @2 bajo la luna* ✨",
  "🥹 *@1 corrió y abrazó a @2 con emoción* 💫",
  "❤️ *@1 abrazó a @2 como si no hubiera un mañana* 🌟",
  "😚 *@1 abrazó dulcemente a @2* 🧸",
  "✨ *@1 y @2 se abrazaron con cariño* 💞"
];

// Ruta para guardar estadísticas
const HUG_PATH = path.resolve("hug_data.json");
const HUG_COOLDOWN = 10 * 60 * 1000; // 10 minutos

const handler = async (msg, { conn, args }) => {
  const isGroup = msg.key.remoteJid.endsWith("@g.us");
  const chatId = msg.key.remoteJid;

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Este comando solo se puede usar en grupos."
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: "🤗", key: msg.key }
  });

  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];

  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  let targetID;

  if (ctx?.participant) {
    targetID = ctx.participant;
  } else if (args[0]) {
    const raw = args[0].replace(/[^0-9]/g, "");
    if (raw) targetID = `${raw}@s.whatsapp.net`;
  }

  if (!targetID) {
    return conn.sendMessage(chatId, {
      text: "💡 Responde al mensaje o menciona a alguien para abrazarlo 🫂"
    }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, {
      text: "😅 No puedes abrazarte a ti mismo..."
    }, { quoted: msg });
  }

  let data = fs.existsSync(HUG_PATH) ? JSON.parse(fs.readFileSync(HUG_PATH)) : {};
  if (!data[chatId]) data[chatId] = { abrazosDados: {}, abrazosRecibidos: {} };

  const ahora = Date.now();
  const last = data[chatId].abrazosDados[senderNum]?.usuarios?.[targetID]?.last || 0;

  if (ahora - last < HUG_COOLDOWN) {
    const mins = Math.ceil((HUG_COOLDOWN - (ahora - last)) / 60000);
    return conn.sendMessage(chatId, {
      text: `⏳ Debes esperar *${mins} minuto(s)* para volver a abrazar a ese usuario.`,
      mentions: [targetID]
    }, { quoted: msg });
  }

  if (!data[chatId].abrazosDados[senderNum]) {
    data[chatId].abrazosDados[senderNum] = { total: 0, usuarios: {} };
  }
  if (!data[chatId].abrazosDados[senderNum].usuarios[targetID]) {
    data[chatId].abrazosDados[senderNum].usuarios[targetID] = { count: 0, last: 0 };
  }
  data[chatId].abrazosDados[senderNum].total += 1;
  data[chatId].abrazosDados[senderNum].usuarios[targetID].count += 1;
  data[chatId].abrazosDados[senderNum].usuarios[targetID].last = ahora;

  const targetNum = targetID.split("@")[0];
  if (!data[chatId].abrazosRecibidos[targetNum]) {
    data[chatId].abrazosRecibidos[targetNum] = { total: 0, usuarios: {} };
  }
  if (!data[chatId].abrazosRecibidos[targetNum].usuarios[senderNum]) {
    data[chatId].abrazosRecibidos[targetNum].usuarios[senderNum] = 0;
  }
  data[chatId].abrazosRecibidos[targetNum].total += 1;
  data[chatId].abrazosRecibidos[targetNum].usuarios[senderNum] += 1;

  fs.writeFileSync(HUG_PATH, JSON.stringify(data, null, 2));

  const gif = gifUrls[Math.floor(Math.random() * gifUrls.length)];
  const texto = textos[Math.floor(Math.random() * textos.length)]
    .replace("@1", `@${senderNum}`)
    .replace("@2", `@${targetNum}`);

  await conn.sendMessage(chatId, {
    video: { url: gif },
    gifPlayback: true,
    caption: texto,
    mentions: [senderID, targetID]
  }, { quoted: msg });
};

handler.command = ["abrazar"];
module.exports = handler;