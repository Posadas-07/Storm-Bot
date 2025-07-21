const fs = require("fs");
const path = require("path");

const marryPath = path.resolve("./marry.json");

function readData() {
  return fs.existsSync(marryPath) ? JSON.parse(fs.readFileSync(marryPath)) : {};
}
function writeData(data) {
  fs.writeFileSync(marryPath, JSON.stringify(data, null, 2));
}

const proposals = {}; // chatId: { proposee: proposer }

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
    }, { quoted: msg });
  }

  // Solo se puede proponer matrimonio respondiendo a un mensaje
  const context = msg.message?.extendedTextMessage?.contextInfo;
  const proposee = context?.participant;
  if (!proposee) {
    return conn.sendMessage(chatId, {
      text: "💍 Responde al mensaje de la persona a la que quieres proponer matrimonio."
    }, { quoted: msg });
  }

  if (proposee === senderId) {
    return conn.sendMessage(chatId, {
      text: "😅 No puedes proponerte matrimonio a ti mismo..."
    }, { quoted: msg });
  }

  // Evitar propuesta si ya están casados
  const data = readData();
  if (!data[chatId]) data[chatId] = {};
  if (data[chatId][senderId]) {
    return conn.sendMessage(chatId, {
      text: `❣️ Ya estás casado con @${data[chatId][senderId].replace(/@s\.whatsapp\.net$/, "")}.`,
      mentions: [data[chatId][senderId]]
    }, { quoted: msg });
  }
  if (data[chatId][proposee]) {
    return conn.sendMessage(chatId, {
      text: `❣️ @${proposee.split("@")[0]} ya está casad@ con @${data[chatId][proposee].replace(/@s\.whatsapp\.net$/, "")}.`,
      mentions: [proposee, data[chatId][proposee]]
    }, { quoted: msg });
  }

  // Guardar propuesta temporal
  proposals[chatId] = { proposee, proposer: senderId };

  // Mensaje de propuesta
  await conn.sendMessage(chatId, {
    text: `💍 @${senderNum} le ha propuesto matrimonio a @${proposee.split("@")[0]}.\n\nResponde a este mensaje con "sí" para aceptar 💞\nO responde con "no" para rechazar 💔.`,
    mentions: [senderId, proposee]
  }, { quoted: msg });
};

// Manejador de respuestas "sí"/"no" al mensaje de propuesta
const replyHandler = async (msg, { conn }) => {
  if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) return;

  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const replyText = (msg.message?.conversation || "").trim().toLowerCase();
  const proposal = proposals[chatId];
  if (!proposal) return;

  // Solo la persona propuesta puede responder
  if (senderId !== proposal.proposee) return;

  // Solo si responde a la propuesta
  const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
  const quotedText = quoted?.conversation || quoted?.text || "";

  if (
    !quotedText.includes("le ha propuesto matrimonio") &&
    !quotedText.includes("Responde a este mensaje con")
  ) return;

  // Procesar respuesta
  if (replyText === "sí" || replyText === "si") {
    // Guardar matrimonio
    let data = readData();
    if (!data[chatId]) data[chatId] = {};
    data[chatId][proposal.proposer] = proposal.proposee;
    data[chatId][proposal.proposee] = proposal.proposer;
    writeData(data);

    // Mensaje bonito de boda
    await conn.sendMessage(chatId, {
      text: `🎉 ¡Felicidades! @${proposal.proposer.replace(/[^0-9]/g, "")} y @${proposal.proposee.replace(/[^0-9]/g, "")} ahora están casados 💖👰🤵`,
      mentions: [proposal.proposer, proposal.proposee]
    }, { quoted: msg });

    // Eliminar propuesta
    delete proposals[chatId];
  } else if (replyText === "no") {
    await conn.sendMessage(chatId, {
      text: `💔 @${proposal.proposee.replace(/[^0-9]/g, "")} ha rechazado la propuesta de matrimonio de @${proposal.proposer.replace(/[^0-9]/g, "")}.`,
      mentions: [proposal.proposer, proposal.proposee]
    }, { quoted: msg });
    delete proposals[chatId];
  }
};

handler.command = ["marry"];
handler.replyHandler = replyHandler;
module.exports = handler;