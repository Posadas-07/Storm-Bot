const fs = require("fs");
const path = require("path");

let propuestasMatrimonio = {};

let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // ❌ Eliminado: verificación de juegos
  // Ya no depende de activos.json

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, { text: "❌ 𝖤𝗌𝗍𝖾 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝗌𝗈𝗅𝗈 𝗉𝗎𝖾𝖽𝖾 𝗎𝗌𝖺𝗋𝗌𝖾 𝖾𝗇 𝗀𝗋𝗎𝗉𝗈𝗌." }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const mentioned = context?.mentionedJid || [];
  let userMentioned = context?.participant || (mentioned.length > 0 ? mentioned[0] : null);

  if (!userMentioned) {
    return conn.sendMessage(chatId, {
      text: "💍 𝖴𝗌𝖺 𝖾𝗅 𝖼𝗈𝗆𝖺𝗇𝖽𝗈 𝖺𝗌𝗂:\n*.casar @usuario* o responde a su mensaje.",
    }, { quoted: msg });
  }

  if (userMentioned === sender) {
    return conn.sendMessage(chatId, {
      text: "❌ 𝖭𝗈 𝗉𝗎𝖾𝖽𝖾𝗌 𝖼𝖺𝗌𝖺𝗋𝗍𝖾 𝖼𝗈𝗇 𝗍𝗂𝗀𝗈 𝗆𝗂𝗌𝗆𝗈 🥲"
    }, { quoted: msg });
  }

  const nombre1 = `@${sender.split("@")[0]}`;
  const nombre2 = `@${userMentioned.split("@")[0]}`;

  const mensajePropuesta = `
💍 𝖯𝖱𝖮𝖯𝖴𝖤𝖲𝖳𝖠 𝖣𝖤 𝖬𝖠𝖳𝖱𝖨𝖬𝖮𝖭𝖨𝖮 💍
┏━━━━━━━━━━━━━━━━━━━━┓
❤️ ${nombre1} 𝗁𝖺 𝖽𝖾𝖼𝗂𝖽𝗂𝖽𝗈 𝗉𝖾𝖽𝗂𝗋𝗅𝖾 𝖾𝗅 𝗆𝖺𝗇𝗈 𝖺 ${nombre2}
🌹 𝖴𝗇 𝖺𝗆𝗈𝗋 𝗉𝗎𝗋𝗈 𝗒 𝖿𝗎𝖾𝗋𝗍𝖾 𝗅𝗈𝗌 𝗎𝗇𝖾...
💌 ¿𝖠𝖼𝖾𝗉𝗍𝖺𝗌 𝖾𝗌𝗍𝖺 𝗁𝖾𝗋𝗆𝗈𝗌𝖺 𝗉𝗋𝗈𝗉𝗎𝖾𝗌𝗍𝖺?

⏳ 𝖳𝗂𝖾𝗇𝖾𝗌 2 𝗆𝗂𝗇𝗎𝗍𝗈𝗌 𝗉𝖺𝗋𝖺 𝗋𝖾𝖺𝖼𝗍𝗂𝗈𝗇𝖺𝗋:
❤️ = 𝖠𝖼𝖾𝗉𝗍𝖺𝗋
👎 = 𝖱𝖾𝖼𝗁𝖺𝗓𝖺𝗋
┗━━━━━━━━━━━━━━━━━━━━┛`.trim();

  let propuestaMsg = await conn.sendMessage(chatId, {
    text: mensajePropuesta,
    mentions: [sender, userMentioned]
  }, { quoted: msg });

  propuestasMatrimonio[propuestaMsg.key.id] = {
    chat: chatId,
    de: sender,
    para: userMentioned,
    mensajeKey: propuestaMsg.key
  };

  conn.ev.on("messages.upsert", async ({ messages }) => {
    let m = messages[0];
    if (!m?.message?.reactionMessage) return;

    let reaction = m.message.reactionMessage;
    let reactedMsgKey = reaction.key;
    let emoji = reaction.text;
    let quienReacciono = m.key.participant || m.key.remoteJid;

    let propuesta = propuestasMatrimonio[reactedMsgKey.id];
    if (!propuesta) return;
    if (quienReacciono !== propuesta.para) return;

    const nombre1 = `@${propuesta.de.split("@")[0]}`;
    const nombre2 = `@${propuesta.para.split("@")[0]}`;

    if (emoji === "❤️") {
      const ruta = "./matrimonios.json";
      let matrimonios = fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta)) : {};

      matrimonios[propuesta.de] = propuesta.para;
      matrimonios[propuesta.para] = propuesta.de;

      fs.writeFileSync(ruta, JSON.stringify(matrimonios, null, 2));

      await conn.sendMessage(propuesta.chat, {
        text: `
💞 𝖲𝖨, 𝖠𝖢𝖤𝖯𝖳𝖮 💞
┏━━━━━━━━━━━━━━━━━━━━┓
👰🤵 ${nombre2} 𝗁𝖺 𝖺𝖼𝖾𝗉𝗍𝖺𝖽𝗈 𝗎𝗇𝗂𝗋𝗌𝖾 𝖾𝗇 𝗆𝖺𝗍𝗋𝗂𝗆𝗈𝗇𝗂𝗈 𝖼𝗈𝗇 ${nombre1}
💍 𝖤𝗅 𝖺𝗆𝗈𝗋 𝗁𝖺 𝗍𝗋𝗂𝗎𝗇𝖿𝖺𝖽𝗈 𝗎𝗇𝖺 𝗏𝖾𝗓 𝗆𝖺́𝗌...
🥂 ¡𝖰𝗎𝖾 𝗏𝗂𝗏𝖺𝗇 𝗅𝗈𝗌 𝗇𝗈𝗏𝗂𝗈𝗌!
┗━━━━━━━━━━━━━━━━━━━━┛`,
        mentions: [propuesta.de, propuesta.para]
      });
    } else if (emoji === "👎") {
      await conn.sendMessage(propuesta.chat, {
        text: `
💔 𝖱𝖤𝖢𝖧𝖠𝖹𝖮 💔
┏━━━━━━━━━━━━━━━━━━━━┓
🥀 ${nombre2} 𝗁𝖺 𝗋𝖾𝖼𝗁𝖺𝗓𝖺𝖽𝗈 𝗅𝖺 𝗉𝗋𝗈𝗉𝗎𝖾𝗌𝗍𝖺 𝖽𝖾 ${nombre1}
😢 𝖤𝗅 𝖺𝗆𝗈𝗋 𝗇𝗈 𝗌𝗂𝖾𝗆𝗉𝗋𝖾 𝖼𝗈𝗋𝗈𝗇𝖺... 𝗉𝖾𝗋𝗈 𝗌𝗂𝖾𝗆𝗉𝗋𝖾 𝖾𝗇𝗌𝖾𝗇̃𝖺.
┗━━━━━━━━━━━━━━━━━━━━┛`,
        mentions: [propuesta.de, propuesta.para]
      });
    }

    delete propuestasMatrimonio[reactedMsgKey.id];
  });
};

handler.command = ['casar'];
handler.tags = ['diversion'];
handler.help = ['casar @usuario (o responde mensaje)'];
module.exports = handler;