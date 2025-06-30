const fetch = require('node-fetch');
const GIFBufferToVideoBuffer = require('../lib/Gifbuffer.js');

const commandMapping = {
  acosar: 'bully',
  abrazar: 'hug',
  llorar: 'cry',
  awoo: 'awoo',
  besar: 'kiss',
  lamer: 'lick',
  acariciar: 'pat',
  engreído: 'smug',
  golpear: 'bonk',
  lanzar: 'yeet',
  ruborizarse: 'blush',
  sonreír: 'smile',
  saludar: 'wave',
  chocar: 'highfive',
  sostener: 'handhold',
  morder: 'bite',
  glomp: 'glomp',
  abofetear: 'slap',
  matar: 'kill',
  feliz: 'happy',
  guiñar: 'wink',
  tocar: 'poke',
  bailar: 'dance',
  cringe: 'cringe'
};

const getBuffer = async (url) => {
  try {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error('Error al obtener buffer:', err);
    throw 'No se pudo obtener el archivo.';
  }
};

const translateGoogle = async (text, sl, tl) => {
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
  const json = await res.json();
  return json[0][0][0];
};

module.exports = {
  name: Object.keys(commandMapping).join('|'),
  tags: ['anime', 'diversión'],
  command: ['acosar', 'abrazar', 'llorar', 'awoo', 'besar', 'lamer', 'acariciar', 'engreído', 'golpear', 'lanzar', 'ruborizarse', 'sonreír', 'saludar', 'chocar', 'sostener', 'morder', 'glomp', 'abofetear', 'matar', 'feliz', 'guiñar', 'tocar', 'bailar', 'cringe'],
  group: true,
  run: async (msg, { conn, args, prefix, lister, command }) => {
    let target;
    if (msg.isGroup) {
      target = msg.mentionedJid[0] || (msg.quoted ? msg.quoted.sender : null);
    } else {
      target = msg.chat;
    }

    if (!target) return msg.reply(`✳️ Etiqueta a alguien.\n\nEjemplo: *${prefix + command} @usuario*`);

    const senderName = await conn.getName(msg.sender);
    const targetName = await conn.getName(target);

    const englishCommand = commandMapping[command.toLowerCase()];
    if (!englishCommand) return msg.reply('❌ Comando no soportado.');

    const res = await fetch(`https://api.waifu.pics/sfw/${englishCommand}`);
    if (!res.ok) return msg.reply('⚠️ No se encontró reacción para este comando.');
    const json = await res.json();

    const gifBuffer = await getBuffer(json.url);
    const videoBuffer = await GIFBufferToVideoBuffer(gifBuffer);

    const translated = await translateGoogle(englishCommand, 'en', 'es');

    await conn.sendMessage(msg.chat, {
      video: videoBuffer,
      caption: `💫 *${senderName}* ${translated} a *${targetName}*`,
      gifPlayback: true,
      gifAttribution: 0
    }, { quoted: msg });

    await conn.sendMessage(msg.chat, { react: { text: '✨', key: msg.key } });
  }
};