const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isGroup) {
    return conn.sendMessage(chatId, {
      text: "❌ Este comando solo puede usarse en grupos."
    }, { quoted: msg });
  }

  const metadata = await conn.groupMetadata(chatId);
  const isAdmin = metadata.participants.find(p => p.id === senderId)?.admin;
  if (!isAdmin && !isOwner) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo *admins* o el *dueño* del bot pueden usar este comando."
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant;

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Responde al mensaje del usuario que quieres hackear (broma)."
    }, { quoted: msg });
  }

  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.owner.some(([id]) => id === targetNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ No puedes hackear al *dueño del bot*."
    }, { quoted: msg });
  }

  const fases = [
    `🔍 Iniciando escaneo de WhatsApp de @${targetNum}...`,
    `📡 Localizando mensajes en la nube...`,
    `📥 Extrayendo stickers, notas de voz y estados...`,
    `🔐 Descifrando cifrado de extremo a extremo...`,
    `📲 Clonando WhatsApp...`,
    `⚠️ Infección de datos en proceso...`,
    `🧠 Accediendo a memoria interna...`,
    `🚫 Eliminando privacidad...`,
    `✅ Hackeo completo: WhatsApp de @${targetNum} ha sido comprometido.`,
    `😱 *Broma completada con éxito.*`
  ];

  const textoFinal = fases.join('\n');

  await conn.sendMessage(chatId, {
    text: textoFinal,
    mentions: [target]
  }, { quoted: msg });
};

handler.command = ["hackear", "asustar"];
module.exports = handler;