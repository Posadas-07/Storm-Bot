// 🔱 Plugin estilo Killua Bot adaptado por ChatGPT
const videos = [
  'https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4',
  'https://telegra.ph/file/0e5b24907be34da0cbe84.mp4',
  'https://telegra.ph/file/6bc3cd10684f036e541ed.mp4',
  'https://telegra.ph/file/3e443a3363a90906220d8.mp4',
  'https://telegra.ph/file/56d886660696365f9696b.mp4',
  'https://telegra.ph/file/3eeadd9d69653803b33c6.mp4',
  'https://telegra.ph/file/436624e53c5f041bfd597.mp4',
  'https://telegra.ph/file/5866f0929bf0c8fe6a909.mp4'
];

module.exports = async (msg, { conn, text, participants }) => {
  const mentioned = msg.mentionedJid && msg.mentionedJid[0];
  const quoted = msg.quoted ? msg.quoted.sender : null;
  const who = mentioned || quoted || msg.sender;

  const name = await conn.getName(who);
  const name2 = await conn.getName(msg.sender);

  await conn.sendMessage(msg.chat, {
    react: {
      text: '🤗',
      key: msg.key
    }
  });

  let texto;
  if (mentioned) {
    texto = `*${name2}* le dio un fuerte abrazo a *${name}* 🫂`;
  } else if (quoted) {
    texto = `*${name2}* abrazó a *${name}* 🫂`;
  } else {
    texto = `*${name2}* se abrazó a sí mismo 🥺`;
  }

  const video = videos[Math.floor(Math.random() * videos.length)];

  await conn.sendMessage(msg.chat, {
    video: { url: video },
    gifPlayback: true,
    caption: texto,
    mentions: [who]
  }, { quoted: msg });
};

module.exports.command = ['hug', 'abrazar'];
module.exports.tags = ['anime'];
module.exports.help = ['hug @tag', 'abrazar @tag'];
module.exports.group = true;