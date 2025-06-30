module.exports = async (m, { conn }) => {
  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const fases = [
    '*[ 👾 INICIANDO HACKER MODE... ]*',
    '*[ ☠️ CONECTANDO A SERVIDOR DE WHATSAPP... ]*',
    '*[ 🔓 DESCIFRANDO CLAVES ENCRIPTADAS... ]*',
    '*[ 👁️‍🗨️ INTERCEPTANDO MENSAJES PRIVADOS... ]*',
    '*[ 💾 CLONANDO WHATSAPP EN LA NUBE... ]*',
    '*[ ⚠️ PROGRESO: 10% ▓░░░░░░░░░░ ]*',
    '*[ ⚠️ PROGRESO: 30% ▓▓▓░░░░░░░░ ]*',
    '*[ ⚠️ PROGRESO: 50% ▓▓▓▓▓░░░░░░ ]*',
    '*[ ⚠️ PROGRESO: 70% ▓▓▓▓▓▓▓░░░░ ]*',
    '*[ ⚠️ PROGRESO: 90% ▓▓▓▓▓▓▓▓▓░░ ]*',
    '*[ ✅ HACK COMPLETADO: 100% ▓▓▓▓▓▓▓▓▓▓ ]*',
    '*[ 🎉 ACCESO A WHATSAPP CONCEDIDO... JAJA ERA BROMA 💀 ]*'
  ];

  for (let fase of fases) {
    await conn.sendMessage(m.chat, { text: fase }, { quoted: m });
    await sleep(1300); // tiempo entre mensajes
  }
};

module.exports.command = ['asustar'];
module.exports.tags = ['fun'];
module.exports.help = ['asustar'];