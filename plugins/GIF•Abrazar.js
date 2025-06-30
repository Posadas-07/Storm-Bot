// 🔱 Código adaptado al estilo Killua Bot por ChatGPT
const fetch = require('node-fetch');

module.exports = {
  command: ['hug', 'abrazar'],
  tags: ['anime'],
  help: ['hug @tag', 'abrazar @tag'],
  group: true,
  premium: false,
  owner: false,
  admin: false,

  async handler(msg, { conn, participants }) {
    let who;

    if (msg.mentionedJid.length > 0) {
      who = msg.mentionedJid[0];
    } else if (msg.quoted) {
      who = msg.quoted.sender;
    } else {
      who = msg.sender;
    }

    const name = await conn.getName(who);
    const name2 = await conn.getName(msg.sender);

    // Emoji de reacción personalizado
    await conn.sendMessage(msg.chat, {
      react: {
        text: '🤗',
        key: msg.key
      }
    });

    // Frase personalizada con markdown
    let texto;
    if (msg.mentionedJid.length > 0) {
      texto = `*${name2}* le dio un fuerte abrazo a *${name}* 🫂`;
    } else if (msg.quoted) {
      texto = `*${name2}* abrazó a *${name}* 🫂`;
    } else {
      texto = `*${name2}* se abrazó a sí mismo 🥺`;
    }

    // Lista de videos tipo gif hug
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

    const video = videos[Math.floor(Math.random() * videos.length)];

    await conn.sendMessage(msg.chat, {
      video: { url: video },
      gifPlayback: true,
      caption: texto,
      mentions: [who]
    }, { quoted: msg });
  }
};