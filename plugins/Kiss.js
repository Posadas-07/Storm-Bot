const fs = require("fs");
const path = require("path");

const gifUrls = [
  "https://media.tenor.com/1YVQejKn_b4AAAAC/anime-kiss.gif",
  "https://media.tenor.com/Jl5TUkbldSgAAAAC/kiss-anime.gif",
  "https://media.tenor.com/qQ1zLi5nms8AAAAC/kiss-anime-couple.gif"
];

const textos = [
  "💋 @1 besó apasionadamente a @2 😳",
  "😍 @1 le plantó un beso intenso a @2 💕",
  "😘 @1 no resistió y besó a @2 💖",
  "🔥 @1 y @2 se dieron un beso ardiente 💦",
  "💘 @1 besó con ternura a @2 😚"
];

const KISS_PATH = path.resolve("kiss_data.json");
const KISS_COOLDOWN = 10 * 60 * 1000;

const handler = async (msg, { conn, args, isOwner }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    return conn.sendMessage(chatId, { text: "⚠️ Solo en grupos." }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: "💋", key: msg.key } });

  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  let targetID;

  if (ctx?.participant) {
    targetID = ctx.participant;
  } else if (ctx?.mentionedJid?.length) {
    targetID = ctx.mentionedJid[0];
  } else if (args[0]) {
    const raw = args[0].replace(/[^0-9]/g, "");
    if (raw) targetID = `${raw}@s.whatsapp.net`;
  }

  if (!targetID) {
    return conn.sendMessage(chatId, { text: "❗ Menciona o responde a alguien para besarlo 💋" }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, { text: "😅 No puedes besarte a ti mismo." }, { quoted: msg });
  }

  let data = fs.existsSync(KISS_PATH) ? JSON.parse(fs.readFileSync(KISS_PATH)) : {};
  if (!data[chatId]) data[chatId] = { besosDados: {}, besosRecibidos: {}, cooldown: {} };

  const ahora = Date.now();

  if (!isOwner) {
    const lastUse = data[chatId].cooldown?.[senderNum] || 0;
    if (ahora - lastUse < KISS_COOLDOWN) {
      const mins = Math.ceil((KISS_COOLDOWN - (ahora - lastUse)) / 60000);
      return conn.sendMessage(chatId, {
        text: `⏳ Espera *${mins} minuto(s)* para volver a besar.`,
        mentions: [senderID]
      }, { quoted: msg });
    }
    data[chatId].cooldown[senderNum] = ahora;
  }

  // Guardar estadísticas
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
    image: { url: gif },
    caption: texto,
    mentions: [senderID, targetID]
  }, { quoted: msg });
};

handler.command = ["kiss"];
module.exports = handler;