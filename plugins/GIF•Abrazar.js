// 🔱 Comando personalizado ABRAZAR - estilo Killua Bot
module.exports = async (msg, { conn }) => {
  const who = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
  const name2 = msg.pushName || msg.sender;
  const name = (await conn.onWhatsApp(who))[0]?.notify || who;

  await conn.sendMessage(msg.chat, {
    react: {
      text: '🤗',
      key: msg.key
    }
  });

  let texto;
  if (msg.mentionedJid?.length) {
    texto = `*${name2}* le dio un fuerte abrazo a *${name}* 🫂`;
  } else if (msg.quoted) {
    texto = `*${name2}* abrazó a *${name}* 🫂`;
  } else {
    texto = `*${name2}* se abrazó a sí mismo 🥺`;
  }

  const gif = 'https://cdn.russellxz.click/c6ea097b.mp4'; // 👈 Aquí tú pones el enlace del gif

  await conn.sendMessage(msg.chat, {
    video: { url: gif },
    gifPlayback: true,
    caption: texto,
    mentions: [who]
  }, { quoted: msg });
};

module.exports.command = ['abrazar'];
module.exports.tags = ['gif'];
module.exports.help = ['abrazar @tag'];
module.exports.group = true;