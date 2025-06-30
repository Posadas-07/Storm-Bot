const fs = require("fs");
const path = require("path");

const gifUrls = [
  "https://cdn.russellxz.click/c6ea097b.mp4",
  "https://cdn.russellxz.click/c6ea097b.mp4",
  "https://cdn.russellxz.click/c6ea097b.mp4",
  "https://cdn.russellxz.click/c6ea097b.mp4"
];

const textos = [
  "💋 @1 abrazo apasionadamente a @2 😳",
  "😍 @1 le plantó un abrazo intenso a @2 💕",
  "😘 @1 no resistió y abrazo a @2 💖",
  "🔥 @1 y @2 se dieron un abrazo ardiente 💦",
  "💘 @1 abrazó con ternura a @2 😚",
  "💞 @1 no dudó y abrazo a @2 bajo la luna 🌙",
  "😳 @1 robó un abrazo a @2 💫",
  "🥵 @1 no aguantó las ganas y abrazo a @2 😍",
  "👄 @1 y @2 se dieron un abrazo inolvidable ✨",
  "❤️ @1 abrazó a @2 como en una novela romántica 📖"
];

const KISS_PATH = path.resolve("kiss_data.json");
const KISS_COOLDOWN = 10 * 60 * 1000; // 10 minutos

const handler = async (msg, { conn, args }) => {
  const isGroup = msg.key.remoteJid.endsWith("@g.us");
  const chatId = msg.key.remoteJid;

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Este comando solo se puede usar en grupos."
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: "💋", key: msg.key }
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
      text: "💡 Responde al mensaje o menciona a alguien para abrazarlo 🤗"
    }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, {
      text: "😅 No puedes abrazarte a ti mismo..."
    }, { quoted: msg });
  }

  let data = fs.existsSync(KISS_PATH) ? JSON.parse(fs.readFileSync(KISS_PATH)) : {};
  if (!data[chatId]) data[chatId] = { besosDados: {}, besosRecibidos: {} };

  const ahora = Date.now();
  const last = data[chatId].besosDados[senderNum]?.usuarios?.[targetID]?.last || 0;

  if (ahora - last < KISS_COOLDOWN) {
    const mins = Math.ceil((KISS_COOLDOWN - (ahora - last)) / 60000);
    return conn.sendMessage(chatId, {
      text: `⏳ Debes esperar *${mins} minuto(s)* para volver a abrazar a ese usuario.`,
      mentions: [targetID]
    }, { quoted: msg });
  }

  if (!data[chatId].besosDados[senderNum]) {
    data[chatId].besosDados[senderNum] = { total: 0, usuarios: {} };
  }
  if (!data[chatId].besosDados[senderNum].usuarios[targetID]) {
    data[chatId].besosDados[senderNum].usuarios[targetID] = { count: 0, last: 0 };
  }
  data[chatId].besosDados[senderNum].total += 1;
  data[chatId].besosDados[senderNum].usuarios[targetID].count += 1;
  data[chatId].besosDados[senderNum].usuarios[targetID].last = ahora;

  const targetNum = targetID.split("@")[0];
  if (!data[chatId].besosRecibidos[targetNum]) {
    data[chatId].besosRecibidos[targetNum] = { total: 0, usuarios: {} };
  }
  if (!data[chatId].besosRecibidos[targetNum].usuarios[senderNum]) {
    data[chatId].besosRecibidos[targetNum].usuarios[senderNum] = 0;
  }
  data[chatId].besosRecibidos[targetNum].total += 1;
  data[chatId].besosRecibidos[targetNum].usuarios[senderNum] += 1;

  fs.writeFileSync(KISS_PATH, JSON.stringify(data, null, 2));

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