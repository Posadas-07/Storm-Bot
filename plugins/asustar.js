module.exports = async (m, { conn, args }) => {
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  // Obtener JID de la víctima
  let mentionedJid = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : args[0]
      ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
      : m.sender;

  const nombreVictima = '@' + mentionedJid.split('@')[0];

  const fases = [
    `*[ 👾 INICIANDO ATAQUE A ${nombreVictima}... ]*`,
    '*[ ☠️ CONECTANDO A SERVIDOR DE WHATSAPP... ]*',
    '*[ 🔓 DESCIFRANDO CLAVES ENCRIPTADAS... ]*',
    '*[ 👁️‍🗨️ INTERCEPTANDO MENSAJES PRIVADOS... ]*',
    '*[ 💾 CLONANDO WHATSAPP EN LA NUBE... ]*',
    '*[ ⚠️ PROGRESO: 10% ▓░░░░░░░░░░ ]*',
    '*[ ⚠️ PROGRESO: 30% ▓▓▓░░░░░░░░ ]*',
    '*[ ⚠️ PROGRESO: 50% ▓▓▓▓▓░░░░░░ ]*',
    '*[ ⚠️ PROGRESO: 70% ▓▓▓▓▓▓▓░░░░ ]*',
    '*[ ⚠️ PROGRESO: 90% ▓▓▓▓▓▓▓▓▓░░ ]*',
    '*[ ✅ ATAQUE COMPLETO: 100% ▓▓▓▓▓▓▓▓▓▓ ]*',
    `*[ 🎉 SE HA ACCEDIDO A WHATSAPP DE ${nombreVictima}... ERA BROMA 💀]*`
  ];

  for (let fase of fases) {
    await conn.sendMessage(m.chat, {
      text: fase,
      mentions: [mentionedJid]
    }, { quoted: m });
    await sleep(1300);
  }
};

module.exports.command = ['asustar'];
module.exports.tags = ['fun'];
module.exports.help = ['asustar @usuario', 'asustar 51912345678'];