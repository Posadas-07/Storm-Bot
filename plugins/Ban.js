const axios = require("axios");

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");

  // Solo dueño
  const isOwner = global.owner.some(([id]) => id === senderNum);
  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "⛔ *Acceso denegado*\nEste comando solo está disponible para el *dueño del bot*.",
    }, { quoted: msg });
  }

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "👥 Este comando solo se puede usar en grupos.",
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant;

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "❗ Responde al mensaje del usuario que deseas *hackear* (broma).",
    }, { quoted: msg });
  }

  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.owner.some(([id]) => id === targetNum)) {
    return conn.sendMessage(chatId, {
      text: "🛡️ No puedes hackear al *dueño del bot*.",
    }, { quoted: msg });
  }

  const mensajeHack = `
╭━━━[ *INICIANDO ATAQUE* ]━━━╮
┃ 👤 Objetivo: @${targetNum}
┃ 🌐 Escaneo de red...
┃ 📡 Clonando base de datos...
┃ 🔍 Revisando chats y stickers...
┃ 🧠 Acceso a memoria interna...
┃ 💾 Extrayendo multimedia...
┃ 🛑 Borrando privacidad...
┃ ✅ *Hackeo completado con éxito*
╰━━━━━━━━━━━━━━━━━━━━━━━╯
😈 *Todo fue una broma. No llores.*
`;

  // Enviar mensaje con mención
  await conn.sendMessage(chatId, {
    text: mensajeHack,
    mentions: [target]
  }, { quoted: msg });

  // Descargar y enviar audio desde URL
  try {
    const audioUrl = "https://cdn.russellxz.click/6aa6ba79.mp3";
    const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });

    await conn.sendMessage(chatId, {
      audio: Buffer.from(response.data),
      mimetype: 'audio/mp4',
      ptt: true
    }, { quoted: msg });
  } catch (e) {
    await conn.sendMessage(chatId, {
      text: "⚠️ Ocurrió un error al enviar el audio. Verifica que la URL esté activa."
    }, { quoted: msg });
  }
};

handler.command = ["hackear", "asustar"];
module.exports = handler;