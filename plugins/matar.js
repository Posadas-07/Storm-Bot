const fs = require("fs");
const path = require("path");

const gifUrls = [
  "https://qu.ax/GQLO.mp4",
  "https://cdn.russellxz.click/55d0a83c.mp4",
  "https://cdn.russellxz.click/dcc7e50a.mp4",
  "https://cdn.russellxz.click/695938b4.mp4"
  // Agrega más URLs de gifs animados aquí
];

const textos = [
  "💀 *@1 asesinó brutalmente a @2* 💣",
  "🔪 *@1 le dio cuello a @2 sin piedad* 😵",
  "☠️ *@1 eliminó de este mundo a @2* 😈",
  "🩸 *@1 le lanzó una granada a @2* 💥",
  "⚔️ *@1 retó a @2 y lo mató en combate* 🛡️",
  "🧨 *@1 explotó a @2 con estilo* 🎇",
  "🔫 *@1 disparó sin titubear a @2* 🚬",
  "😵‍💫 *@1 hizo desaparecer a @2 como Thanos* ✨",
  "💣 *@1 bombardeó a @2 en su base secreta* 🕵️‍♂️",
  "🥷 *@1 se convirtió en ninja y acabó con @2* 👤"
];

const KILL_PATH = path.resolve("kill_data.json");
const KILL_COOLDOWN = 10 * 60 * 1000; // 10 minutos

const handler = async (msg, { conn, args }) => {
  const isGroup = msg.key.remoteJid.endsWith("@g.us");
  const chatId = msg.key.remoteJid;

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Este comando solo se puede usar en grupos."
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: "☠️", key: msg.key }
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
      text: "💡 Responde al mensaje o menciona a alguien para matarlo virtualmente ☠️"
    }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, {
      text: "😅 No puedes matarte a ti mismo..."
    }, { quoted: msg });
  }

  let data = fs.existsSync(KILL_PATH) ? JSON.parse(fs.readFileSync(KILL_PATH)) : {};
  if (!data.cooldown) data.cooldown = {};
  if (!data[chatId]) data[chatId] = { killsDados: {}, killsRecibidos: {} };

  const ahora = Date.now();
  const last = data.cooldown[senderNum] || 0;

  if (!isOwner && ahora - last < KILL_COOLDOWN) {
    const mins = Math.ceil((KILL_COOLDOWN - (ahora - last)) / 60000);
    return conn.sendMessage(chatId, {
      text: `⏳ Espera *${mins} minuto(s)* para volver a usar el comando.`,
      mentions: [senderID]
    }, { quoted: msg });
  }

  if (!isOwner) {
    data.cooldown[senderNum] = ahora;
  }

  // Guardar kills dados
  if (!data[chatId].killsDados[senderNum]) {
    data[chatId].killsDados[senderNum] = { total: 0, usuarios: {} };
  }
  if (!data[chatId].killsDados[senderNum].usuarios[targetID]) {
    data[chatId].killsDados[senderNum].usuarios[targetID] = { count: 0, last: 0 };
  }
  data[chatId].killsDados[senderNum].total += 1;
  data[chatId].killsDados[senderNum].usuarios[targetID].count += 1;
  data[chatId].killsDados[senderNum].usuarios[targetID].last = ahora;

  // Guardar kills recibidos
  const targetNum = targetID.split("@")[0];
  if (!data[chatId].killsRecibidos[targetNum]) {
    data[chatId].killsRecibidos[targetNum] = { total: 0, usuarios: {} };
  }
  if (!data[chatId].killsRecibidos[targetNum].usuarios[senderNum]) {
    data[chatId].killsRecibidos[targetNum].usuarios[senderNum] = 0;
  }
  data[chatId].killsRecibidos[targetNum].total += 1;
  data[chatId].killsRecibidos[targetNum].usuarios[senderNum] += 1;

  fs.writeFileSync(KILL_PATH, JSON.stringify(data, null, 2));

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

handler.command = ["matar"];
module.exports = handler;