const fs = require("fs");
const path = require("path");

const WARN_PATH = path.resolve("warn_data.json");
const MAX_WARNINGS = 3;

const handler = async (msg, { conn, args, participants }) => {
  const chatId = msg.key.remoteJid;
  if (!chatId.endsWith("@g.us")) return;

  const senderID = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderID.split("@")[0];
  const botID = conn.user?.id || conn.user?.jid || "";

  // ✅ Validación de admin sin .some que crashee
  let isSenderAdmin = false;
  let isBotAdmin = false;

  if (Array.isArray(participants)) {
    isSenderAdmin = participants.some(p => p.id === senderID && p.admin);
    isBotAdmin = participants.some(p => p.id === botID && p.admin);
  }

  if (!isSenderAdmin) {
    return conn.sendMessage(chatId, {
      text: "🚫 Solo los administradores pueden usar este comando."
    }, { quoted: msg });
  }

  if (!isBotAdmin) {
    return conn.sendMessage(chatId, {
      text: "🤖 El bot necesita ser administrador para poder expulsar usuarios."
    }, { quoted: msg });
  }

  // Obtener usuario objetivo
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
      text: "🔎 Responde o menciona a alguien para advertirlo."
    }, { quoted: msg });
  }

  if (targetID === senderID) {
    return conn.sendMessage(chatId, {
      text: "😅 No puedes advertirte a ti mismo."
    }, { quoted: msg });
  }

  const targetNum = targetID.split("@")[0];

  let data = {};
  try {
    if (fs.existsSync(WARN_PATH)) {
      data = JSON.parse(fs.readFileSync(WARN_PATH));
    }
  } catch {
    data = {};
  }

  if (!data[chatId]) data[chatId] = {};
  if (!data[chatId][targetID]) data[chatId][targetID] = 0;

  data[chatId][targetID] += 1;
  const warns = data[chatId][targetID];

  fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2));

  if (warns >= MAX_WARNINGS) {
    await conn.sendMessage(chatId, {
      text: `❌ @${targetNum} fue advertido 3 veces y será eliminado.`,
      mentions: [targetID]
    }, { quoted: msg });

    await conn.groupParticipantsUpdate(chatId, [targetID], "remove");

    data[chatId][targetID] = 0;
    fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2));
  } else {
    await conn.sendMessage(chatId, {
      text: `⚠️ @${targetNum} ha sido advertido.\nAdvertencias: *${warns}/3*`,
      mentions: [targetID]
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    react: { text: "⚠️", key: msg.key }
  });
};

handler.command = ["advertencia", "warn"];
module.exports = handler;