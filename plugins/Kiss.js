const fs = require("fs");
const path = require("path");
const axios = require("axios");

const gifUrls = [
  "https://cdn.russellxz.click/5b056a4b.mp4",
  "https://cdn.russellxz.click/5c5a4f5c.mp4",
  "https://cdn.russellxz.click/f70fb41b.mp4",
  "https://cdn.russellxz.click/45e2ec30.mp4"
];

const textos = [
  "💋 @1 besó apasionadamente a @2 😳",
  "😍 @1 le plantó un beso intenso a @2 💕",
  "😘 @1 no resistió y besó a @2 💖",
  "🔥 @1 y @2 se dieron un beso ardiente 💦",
  "💘 @1 besó con ternura a @2 😚",
  "💞 @1 no dudó y besó a @2 bajo la luna 🌙",
  "😳 @1 robó un beso a @2 💫",
  "🥵 @1 no aguantó las ganas y besó a @2 😍",
  "👄 @1 y @2 se dieron un beso inolvidable ✨",
  "❤️ @1 besó a @2 como en una novela romántica 📖"
];

const KISS_PATH = path.resolve("kiss_data.json");
const KISS_COOLDOWN = 10 * 60 * 1000;

const handler = async (msg, { conn, args, isOwner }) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    return conn.sendMessage(chatId, { text: "⚠️ Solo funciona en grupos." }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: "💋", key: msg.key } });

  // ⚠️ DEBUG 1
  await conn.sendMessage(chatId, { text: "✅ Paso 1: Mensaje recibido", quoted: msg });

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
    return conn.sendMessage(chatId, { text: "❗ Menciona a alguien o responde su mensaje.", quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, { text: "😅 No puedes besarte a ti mismo.", quoted: msg });
  }

  let data = fs.existsSync(KISS_PATH) ? JSON.parse(fs.readFileSync(KISS_PATH)) : {};
  if (!data[chatId]) data[chatId] = { besosDados: {}, besosRecibidos: {}, cooldown: {} };

  const ahora = Date.now();

  if (!isOwner) {
    const lastUse = data[chatId].cooldown?.[senderNum] || 0;
    if (ahora - lastUse < KISS_COOLDOWN) {
      const mins = Math.ceil((KISS_COOLDOWN - (ahora - lastUse)) / 60000);
      return conn.sendMessage(chatId, {
        text: `⏳ Espera *${mins} minuto(s)* antes de usar el comando otra vez.`,
        mentions: [senderID]
      }, { quoted: msg });
    }
    data[chatId].cooldown[senderNum] = ahora;
  }

  // ⚠️ DEBUG 2
  await conn.sendMessage(chatId, { text: "✅ Paso 2: Cooldown superado", quoted: msg });

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

  // ⚠️ DEBUG 3
  await conn.sendMessage(chatId, { text: "✅ Paso 3: Datos guardados", quoted: msg });

  const gif = gifUrls[Math.floor(Math.random() * gifUrls.length)];
  const texto = textos[Math.floor(Math.random() * textos.length)]
    .replace("@1", `@${senderNum}`)
    .replace("@2", `@${targetNum}`);

  try {
    const response = await axios.get(gif, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    await conn.sendMessage(chatId, {
      video: buffer,
      gifPlayback: true,
      caption: texto,
      mentions: [senderID, targetID]
    }, { quoted: msg });

  } catch (error) {
    console.error("❌ Error al enviar el video:", error.message);
    await conn.sendMessage(chatId, {
      text: "❌ Error al cargar el beso. Verifica la conexión o el enlace.",
      quoted: msg
    });
  }
};

handler.command = ["kiss"];
module.exports = handler;