// 🔱 Comando ABRAZAR desde cero – estilo Killua sin errores
module.exports = async (msg, { conn }) => {
  let who = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
  let nombreQuienManda = msg.pushName || 'Alguien';
  let nombreObjetivo = who.split('@')[0]; // Solo número sin @s.whatsapp.net

  // Emoji de reacción
  await conn.sendMessage(msg.chat, {
    react: {
      text: '🤗',
      key: msg.key
    }
  });

  // Mensaje de abrazo
  let texto;
  if (msg.mentionedJid?.length || msg.quoted) {
    texto = `*${nombreQuienManda}* le dio un fuerte abrazo a *@${nombreObjetivo}* 🫂`;
  } else {
    texto = `*${nombreQuienManda}* se abrazó a sí mismo 🥺`;
  }

  // Aquí tú colocas tu URL de gif personalizado
  let gifUrl = 'https://cdn.russellxz.click/c6ea097b.mp4'; // 🔧 CAMBIA ESTO

  await conn.sendMessage(msg.chat, {
    video: { url: gifUrl },
    gifPlayback: true,
    caption: texto,
    mentions: [who]
  }, { quoted: msg });
};

module.exports.command = ['abrazar'];
module.exports.tags = ['gif'];
module.exports.help = ['abrazar @etiqueta'];
module.exports.group = true;