const fs = require("fs");
const path = "./matrimonios.json";

let handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // ❌ Eliminado: verificación de juegos
  // Ya no depende de activos.json

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, {
      text: "❌ 𝖤𝗌𝗍𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗎𝗌𝖺𝗋𝗌𝖾 𝖾𝗇 𝗀𝗋𝗎𝗉𝗈𝗌."
    }, { quoted: msg });
  }

  const matrimonios = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
  const senderId = sender;
  const parejaId = matrimonios[senderId];

  if (!parejaId) {
    return conn.sendMessage(chatId, {
      text: `❌ 𝖭𝗈 𝖾𝗌𝗍𝖺𝗌 𝖼𝖺𝗌𝖺𝖽𝗈 𝖼𝗈𝗇 𝗇𝖺𝖽𝗂𝖾.\n𝖴𝗌𝖺 *.casar @usuario* 𝗉𝖺𝗋𝖺 𝗎𝗇𝗂𝗋𝗍𝖾 𝖾𝗇 𝗆𝖺𝗍𝗋𝗂𝗆𝗈𝗇𝗂𝗈.`
    }, { quoted: msg });
  }

  delete matrimonios[senderId];
  delete matrimonios[parejaId];
  fs.writeFileSync(path, JSON.stringify(matrimonios, null, 2));

  const nombre1 = `@${senderId.split("@")[0]}`;
  const nombre2 = `@${parejaId.split("@")[0]}`;

  await conn.sendMessage(chatId, {
    text: `
💔 𝖣𝖨𝖵𝖮𝖱𝖢𝖨𝖮 𝖢𝖮𝖭𝖥𝖨𝖱𝖬𝖠𝖣𝖮 💔
┏━━━━━━━━━━━━━━━━━━━━┓
🥀 ${nombre1} 𝗒 ${nombre2} 𝗁𝖺𝗇 𝗋𝗈𝗍𝗈 𝗌𝗎 𝗅𝖺𝗓𝗈 𝗆𝖺𝗍𝗋𝗂𝗆𝗈𝗇𝗂𝗈𝗅.
💔 𝖫𝖺 𝗋𝖾𝗅𝖺𝖼𝗂𝗈́𝗇 𝗁𝖺 𝗌𝗂𝖽𝗈 𝖽𝗂𝗌𝗌𝗎𝖾𝗅𝗍𝖺 𝗉𝖺𝗋𝖺 𝗌𝗂𝖾𝗆𝗉𝗋𝖾.
💭 𝖤𝗅 𝖺𝗆𝗈𝗋 𝗌𝖾 𝖿𝗎𝖾, 𝗉𝖾𝗋𝗈 𝗅𝖺𝗌 𝗋𝖾𝗰𝗎𝖾𝗋𝖽𝗈𝗌 𝗊𝗎𝖾𝖽𝖺𝗇...
┗━━━━━━━━━━━━━━━━━━━━┛`,
    mentions: [senderId, parejaId]
  }, { quoted: msg });
};

handler.command = ['divorcio'];
handler.tags = ['diversion'];
handler.help = ['divorcio'];
module.exports = handler;