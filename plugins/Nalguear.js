const fs = require("fs");
const path = require("path");

const gifUrls = [
  "https://cdn.russellxz.click/e5687475.mp4",
  "https://cdn.russellxz.click/6ab9e804.mp4",
  "https://cdn.russellxz.click/8678bcf5.mp4",
  "https://cdn.russellxz.click/d135bb52.mp4"
];

const textos = [
  "🍑 *@1 le dio una nalgada a @2* 😳",
  "🙈 *@1 le pegó una fuerte nalgada a @2* 🔥",
  "😏 *@1 no se contuvo y nalgueó a @2* 💥",
  "💢 *@1 le estampó una nalgada a @2* 🖐️",
  "💥 *@1 no dudó y le dio tremenda nalgada a @2* 😝",
  "😜 *@1 acarició las nalgas de @2 con una palmada* 👋",
  "😂 *@1 nalgueó a @2 frente a todos* 😳",
  "💫 *@1 sacó la mano y ¡zas! tremenda nalgada para @2* 😆",
  "🔥 *@1 le dio una nalgada intensa a @2* 🍑",
  "💨 *@1 dejó marcadas las huellas en las nalgas de @2* 👋"
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
    react: { text: "🍑", key: msg.key }
  });

  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];

  const isOwner = global.owner.some(([id]) => id === senderNum);

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
      text: "💡 Responde al mensaje o menciona a alguien para nalguearlo 🍑"
    }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, {
      text: "😅 No puedes darte una nalgada a ti mismo..."
    }, { quoted: msg });
  }

  let data = fs.existsSync(KISS_PATH) ? JSON.parse(fs.readFileSync(KISS_PATH)) : {};
  if (!data.cooldown) data.cooldown = {};
  if (!data[chatId]) data[chatId] = { besosDados: {}, besosRecibidos: {} };

  const ahora = Date.now();
  const last = data.cooldown[senderNum] || 0;

  if (!isOwner && ahora - last < KISS_COOLDOWN) {
    const mins = Math.ceil((KISS_COOLDOWN - (ahora - last)) / 60000);
    return conn.sendMessage(chatId, {
      text: `⏳ Espera *${mins} minuto(s)* para volver a usar el comando.`,
      mentions: [senderID]
    }, { quoted: msg });
  }

  if (!isOwner) {
    data.cooldown[senderNum] = ahora;
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

handler.command = ["nalguear"];
module.exports = handler;