const fs = require("fs");
const path = require("path");

const gifUrls = [
  "https://cdn.russellxz.click/5b056a4b.mp4",
  "https://cdn.russellxz.click/5c5a4f5c.mp4",
  "https://cdn.russellxz.click/f70fb41b.mp4",
  "https://cdn.russellxz.click/45e2ec30.mp4"
];

const textosPropuesta = [
  "💍 *@1 le está pidiendo matrimonio a @2* ¿Aceptas? Responde con 'sí' para casarte o 'no' para rechazar.",
  "✨ *@1 quiere casarse con @2* ¿Aceptas esta propuesta?",
  "😍 *@1 ha decidido dar el gran paso con @2* ¿Quieres casarte?",
  "❤️ *@1 quiere compartir su vida con @2*. ¿Aceptas casarte?",
];

const textosAceptado = [
  "🎊 ¡Felicidades @1 y @2! Ahora están casados, que disfruten su luna de miel 🌙💖",
  "💍 @1 y @2 han unido sus vidas ante todos, ¡qué viva el amor! 💞",
  "🥂 ¡Brindemos por el matrimonio de @1 y @2! Que sean muy felices juntos 🎉",
  "👰🤵 ¡La boda fue un éxito! @1 y @2 son oficialmente esposos 🥰",
  "🌹 ¡El amor triunfó! @1 y @2 ahora son pareja para toda la vida 💘"
];

const textosRechazo = [
  "💔 Qué triste, @2 rechazó la propuesta de matrimonio de @1. ¡Ánimo!",
  "😢 El amor no siempre es correspondido... @2 dijo que no a @1.",
  "⛔ @2 decidió no casarse con @1. ¡Quizá en otra ocasión!",
  "😭 No hubo boda... @2 rechazó a @1."
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

  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];

  const isOwner = global.owner?.some(([id]) => id === senderNum);

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

  const texto = textosPropuesta[Math.floor(Math.random() * textosPropuesta.length)]
    .replace("@1", `@${senderNum}`)
    .replace("@2", `@${targetID.split("@")[0]}`);

  // Mensaje solo texto de propuesta
  await conn.sendMessage(chatId, {
    text: texto,
    mentions: [senderID, targetID]
  }, { quoted: msg });
};

// Handler secundario para aceptar/rechazar el matrimonio
const onReplyMarriage = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const replyText = (msg.message?.conversation || '').trim().toLowerCase();
  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];

  // Obtener el mensaje al que están respondiendo
  const quotedKey = msg.message?.extendedTextMessage?.contextInfo?.stanzaId ||
                    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.key?.id;

  if (!quotedKey) return; // No es respuesta a un mensaje

  let data = fs.existsSync(MARRY_PATH) ? JSON.parse(fs.readFileSync(MARRY_PATH)) : {};
  if (!data[chatId]) return;

  // Buscar propuesta pendiente
  let proposerNum = null;
  for (const pn of Object.keys(data[chatId].propuestas[senderID] || {})) {
    if (data[chatId].propuestas[senderID][pn].mensajeId === quotedKey) {
      proposerNum = pn;
      break;
    }
  }
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

    // Mensaje bonito + gif
    const gif = gifUrls[Math.floor(Math.random() * gifUrls.length)];
    const texto = textosAceptado[Math.floor(Math.random() * textosAceptado.length)]
      .replace("@1", `@${proposerNum}`)
      .replace("@2", `@${senderNum}`);

    await conn.sendMessage(chatId, {
      video: { url: gif },
      gifPlayback: true,
      caption: texto,
      mentions: [`${proposerNum}@s.whatsapp.net`, senderID]
    }, { quoted: msg });
  } else if (replyText === "no") {
    // Eliminar propuesta
    delete data[chatId].propuestas[senderID][proposerNum];
    fs.writeFileSync(MARRY_PATH, JSON.stringify(data, null, 2));

    // Solo texto de rechazo
    const texto = textosRechazo[Math.floor(Math.random() * textosRechazo.length)]
      .replace("@1", `@${proposerNum}`)
      .replace("@2", `@${senderNum}`);

    await conn.sendMessage(chatId, {
      text: texto,
      mentions: [`${proposerNum}@s.whatsapp.net`, senderID]
    }, { quoted: msg });
  }
};

// Recuerda conectar este handler en tu flujo principal de mensajes:
// if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
//   handler.onReplyMarriage(msg, { conn });
// }

handler.command = ["marry", "casarse", "matrimonio"];
handler.onReplyMarriage = onReplyMarriage;

module.exports = handler;