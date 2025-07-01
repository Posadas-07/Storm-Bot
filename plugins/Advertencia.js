const fs = require("fs");
const path = require("path");

const WARN_PATH = path.resolve("warn_data.json");
const MAX_WARNINGS = 3;

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  if (!chatId.endsWith("@g.us")) return;

  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];
  const botID = conn.user?.id || conn.user?.jid;

  // Obtener participantes en el grupo (para ver admin)
  const metadata = await conn.groupMetadata(chatId);
  const participants = metadata.participants || [];

  const isSenderAdmin = participants.some(p => p.id === senderID && (p.admin === "admin" || p.admin === "superadmin"));
  const isBotAdmin = participants.some(p => p.id === botID && (p.admin === "admin" || p.admin === "superadmin"));

  if (!isSenderAdmin) {
    return conn.sendMessage(chatId, {
      text: "🚫 *Solo los administradores pueden usar este comando.*"
    }, { quoted: msg });
  }

  if (!isBotAdmin) {
    return conn.sendMessage(chatId, {
      text: "🤖 *Necesito ser administrador para poder expulsar usuarios con 3 advertencias.*"
    }, { quoted: msg });
  }

  // Obtener objetivo (mencionado o mensaje respondido)
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  let targetID;

  if (ctx?.participant) {
    targetID = ctx.participant;
  } else if (args[0]) {
    const num = args[0].replace(/[^0-9]/g, "");
    if (num) targetID = `${num}@s.whatsapp.net`;
  }

  if (!targetID) {
    return conn.sendMessage(chatId, {
      text: "🔎 *Menciona o responde a alguien para advertirlo.*"
    }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, {
      text: "😅 *No puedes advertirte a ti mismo.*"
    }, { quoted: msg });
  }

  const targetNum = targetID.split("@")[0];

  // Leer o crear archivo de advertencias
  let data = {};
  if (fs.existsSync(WARN_PATH)) {
    try {
      data = JSON.parse(fs.readFileSync(WARN_PATH));
    } catch {
      data = {};
    }
  }

  if (!data[chatId]) data[chatId] = {};
  if (!data[chatId][targetID]) data[chatId][targetID] = 0;

  data[chatId][targetID] += 1;
  const warns = data[chatId][targetID];

  fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2));

  if (warns >= MAX_WARNINGS) {
    await conn.sendMessage(chatId, {
      text: `❌ @${targetNum} ha recibido *3 advertencias* y será *eliminado del grupo*.`,
      mentions: [targetID]
    }, { quoted: msg });

    await conn.groupParticipantsUpdate(chatId, [targetID], "remove");

    // Reiniciar advertencias
    data[chatId][targetID] = 0;
    fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2));
  } else {
    await conn.sendMessage(chatId, {
      text: `⚠️ @${targetNum} ha recibido una *advertencia*.\n📌 Advertencias: *${warns}/3*`,
      mentions: [targetID]
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: "⚠️", key: msg.key }
  });
};

handler.command = ["advertencia", "warn"];
module.exports = handler;