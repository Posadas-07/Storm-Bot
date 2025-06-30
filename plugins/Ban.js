const { delay } = require("@adiwajshing/baileys"); // Asegúrate de tener esta función o crea tu propio delay

const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const senderId = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isGroup = chatId.endsWith("@g.us");
  const isOwner = global.owner.some(([id]) => id === senderNum);

  if (!isOwner) {
    return conn.sendMessage(chatId, {
      text: "❌ Solo el *dueño del bot* puede usar este comando."
    }, { quoted: msg });
  }

  const context = msg.message?.extendedTextMessage?.contextInfo;
  const target = context?.participant;

  if (!target) {
    return conn.sendMessage(chatId, {
      text: "⚠️ Responde al mensaje del usuario que quieres asustar."
    }, { quoted: msg });
  }

  const targetNum = target.replace(/[^0-9]/g, "");
  if (global.owner.some(([id]) => id === targetNum)) {
    return conn.sendMessage(chatId, {
      text: "❌ No puedes hackear al *dueño del bot*."
    }, { quoted: msg });
  }

  // Crear barra de progreso
  const crearBarra = (porcentaje) => {
    const total = 20;
    const llenos = Math.floor((porcentaje / 100) * total);
    const vacíos = total - llenos;
    return `[${'█'.repeat(llenos)}${'░'.repeat(vacíos)}] ${porcentaje}%`;
  };

  let porcentaje = 0;
  const mensajeInicial = await conn.sendMessage(chatId, {
    text: `🛠️ Hackeando WhatsApp de @${targetNum}...\n${crearBarra(porcentaje)}`,
    mentions: [target]
  }, { quoted: msg });

  while (porcentaje < 100) {
    porcentaje += 5;
    await delay(500); // medio segundo entre actualizaciones

    await conn.sendMessage(chatId, {
      edit: mensajeInicial.key,
      text: `🛠️ Hackeando WhatsApp de @${targetNum}...\n${crearBarra(porcentaje)}`,
      mentions: [target]
    });
  }

  // Finalizar
  await delay(800);
  await conn.sendMessage(chatId, {
    edit: mensajeInicial.key,
    text: `✅ Hackeo completo. WhatsApp de @${targetNum} ha sido comprometido... era *broma* 😄`,
    mentions: [target]
  });
};

handler.command = ["asustar", "hackear"];
module.exports = handler;