const fs = require("fs");
const path = require("path");

const gifUrls = [
  "https://cdn.russellxz.click/900d0c09.mp4",
  "https://cdn.russellxz.click/087c498d.mp4",
  "https://cdn.russellxz.click/ed4f584d.mp4"
];

const textos = [
  "💍 *@1 le pidió matrimonio a @2* ¡Qué romántico! 🥰",
  "✨ *@1 quiere casarse con @2* ¿Aceptas esta propuesta? 💖",
  "😍 *@1 está listo para dar el gran paso con @2* 👰🤵",
  "❤️ *@1 quiere unir su vida a la de @2* para siempre 💞",
  "🌹 *@1 ha declarado su amor eterno a @2* ¿Será correspondido? 🌙",
  "💘 *@1 quiere compartir su vida con @2* ¿Aceptas? 💍",
  "🎉 *@1 y @2 podrían celebrar una hermosa boda* ¿Sí o no? 🥳",
  "💑 *@1 sueña con casarse con @2* ¿Acepta la propuesta? 💖"
];

const MARRY_PATH = path.resolve("marry_data.json");
const MARRY_COOLDOWN = 10 * 60 * 1000; // 10 minutos

const handler = async (msg, { conn, args }) => {
  const isGroup = msg.key.remoteJid.endsWith("@g.us");
  const chatId = msg.key.remoteJid;

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Este comando solo se puede usar en grupos."
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: "💍", key: msg.key }
  });

  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];

  const isOwner = global.owner.some(([id]) => id === senderNum);

  // Obtener destinatario
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
      text: "💡 Responde al mensaje o menciona a alguien para pedirle matrimonio 💍"
    }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, {
      text: "😅 No puedes pedirte matrimonio a ti mismo..."
    }, { quoted: msg });
  }

  let data = fs.existsSync(MARRY_PATH) ? JSON.parse(fs.readFileSync(MARRY_PATH)) : {};
  if (!data.cooldown) data.cooldown = {};
  if (!data[chatId]) data[chatId] = { propuestas: {}, matrimonios: {} };

  const ahora = Date.now();
  const last = data.cooldown[senderNum] || 0;

  if (!isOwner && ahora - last < MARRY_COOLDOWN) {
    const mins = Math.ceil((MARRY_COOLDOWN - (ahora - last)) / 60000);
    return conn.sendMessage(chatId, {
      text: `⏳ Espera *${mins} minuto(s)* para volver a usar el comando.`,
      mentions: [senderID]
    }, { quoted: msg });
  }

  if (!isOwner) {
    data.cooldown[senderNum] = ahora;
  }

  // Guardar propuesta
  if (!data[chatId].propuestas[targetID]) data[chatId].propuestas[targetID] = {};
  data[chatId].propuestas[targetID][senderNum] = {
    time: ahora,
    mensajeId: msg.key.id
  };

  fs.writeFileSync(MARRY_PATH, JSON.stringify(data, null, 2));

  const gif = gifUrls[Math.floor(Math.random() * gifUrls.length)];
  const texto = textos[Math.floor(Math.random() * textos.length)]
    .replace("@1", `@${senderNum}`)
    .replace("@2", `@${targetID.split("@")[0]}`);

  // Mensaje de propuesta con instrucciones
  await conn.sendMessage(chatId, {
    video: { url: gif },
    gifPlayback: true,
    caption: `${texto}\n\nResponde a este mensaje con *Sí* para aceptar 💍\nResponde con *No* para rechazar 💔`,
    mentions: [senderID, targetID]
  }, { quoted: msg });
};

// Handler secundario para aceptar/rechazar el matrimonio
handler.onReply = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const replyText = (msg.message?.conversation || '').trim().toLowerCase();
  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];

  let data = fs.existsSync(MARRY_PATH) ? JSON.parse(fs.readFileSync(MARRY_PATH)) : {};
  if (!data[chatId]) return;

  // Verificar si hay propuesta pendiente
  const propuestas = data[chatId].propuestas[senderID];
  if (!propuestas) return;

  // Buscar el primer usuario que le propuso matrimonio
  const proposerNum = Object.keys(propuestas)[0];
  if (!proposerNum) return;

  if (replyText === "sí" || replyText === "si") {
    // Guardar matrimonio
    if (!data[chatId].matrimonios[senderID]) data[chatId].matrimonios[senderID] = [];
    if (!data[chatId].matrimonios[proposerNum]) data[chatId].matrimonios[proposerNum] = [];
    data[chatId].matrimonios[senderID].push(proposerNum);
    data[chatId].matrimonios[proposerNum].push(senderID);

    // Eliminar propuesta
    delete data[chatId].propuestas[senderID][proposerNum];
    fs.writeFileSync(MARRY_PATH, JSON.stringify(data, null, 2));

    await conn.sendMessage(chatId, {
      text: `🎊 ¡Felicidades @${proposerNum} y @${senderNum}, ahora están casados! 🥰💍`,
      mentions: [`${proposerNum}@s.whatsapp.net`, senderID]
    }, { quoted: msg });
  } else if (replyText === "no") {
    // Eliminar propuesta
    delete data[chatId].propuestas[senderID][proposerNum];
    fs.writeFileSync(MARRY_PATH, JSON.stringify(data, null, 2));

    await conn.sendMessage(chatId, {
      text: `💔 @${senderNum} rechazó la propuesta de matrimonio de @${proposerNum}.`,
      mentions: [`${proposerNum}@s.whatsapp.net`, senderID]
    }, { quoted: msg });
  }
};

handler.command = ["marry", "casarse", "matrimonio"];
module.exports = handler;