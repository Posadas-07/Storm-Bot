// 🔱 Comando ABRAZAR desde cero – sin errores y estilo Killua
module.exports = async (msg, { conn }) => {
  const quienManda = msg.pushName || 'Alguien';
  const quienRecibe = msg.mentionedJid?.[0] || msg.quoted?.sender;

  // Emoji de reacción
  await conn.sendMessage(msg.chat, {
    react: {
      text: '🤗',
      key: msg.key
    }
  });

  // Mensaje de respuesta
  let texto = '';
  if (quienRecibe) {
    const id = quienRecibe.split('@')[0];
    texto = `*${quienManda}* le dio un fuerte abrazo a *@${id}* 🫂`;
  } else {
    texto = `*${quienManda}* se abrazó a sí mismo 🥺`;
  }

  // Coloca aquí tu gif personalizado
  const gif = 'URL_DEL_GIF'; // 🔧 REEMPLÁZALO CON TU GIF

  await conn.sendMessage(msg.chat, {
    video: { url: gif },
    gifPlayback: true,
    caption: texto,
    mentions: quienRecibe ? [quienRecibe] : []
  }, { quoted: msg });
};

module.exports.command = ['abrazar'];
module.exports.tags = ['gif'];
module.exports.help = ['abrazar @etiqueta'];
module.exports.group = true;