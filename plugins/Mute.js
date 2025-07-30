const fs = require('fs');
const path = './mute.json';

let handler = async (m, { conn, args, participants, mentionedJid }) => {
  const chatId = m.chat;

  // Validar mención o número
  const user = mentionedJid && mentionedJid[0]
    ? mentionedJid[0]
    : args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  if (!user) {
    return conn.reply(m.chat, '❌ Menciona o escribe el número del usuario que quieres mutear.', m);
  }

  // Cargar muteData
  let muteData = JSON.parse(fs.readFileSync(path));

  if (!muteData[chatId]) muteData[chatId] = {};

  if (muteData[chatId][user]) {
    return conn.reply(m.chat, `⚠️ @${user.split('@')[0]} ya está muteado.`, m, { mentions: [user] });
  }

  // Agregar al usuario como muteado
  muteData[chatId][user] = true;

  // Guardar cambios
  fs.writeFileSync(path, JSON.stringify(muteData, null, 2));

  conn.reply(m.chat, `✅ Usuario @${user.split('@')[0]} ha sido muteado.`, m, { mentions: [user] });
};

handler.command = ['mute'];
handler.group = true;
handler.admin = true;

module export handler;