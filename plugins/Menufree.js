const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;
  const prefix = global.prefix;

  try {
    // Reacción al usar el comando
    await conn.sendMessage(chatId, { react: { text: "📋", key: msg.key } });

    // Imagen fija del menú
    const imgUrl = 'https://cdn.russellxz.click/706326cf.jpeg';

    // Menú con marca de agua al final
    const texto = `╭──────>⋆☽⋆⋆☾⋆<──────╮
   ✰ 𝙁𝙍𝙀𝙀 𝙁𝙄𝙍𝙀 𝙈𝙀𝙉𝙐 ✰
╰──────>⋆☽⋆⋆☾⋆<──────╯

📃 𝗥𝗘𝗚𝗟𝗔𝗦 📃
🍉 ➺ *${prefix}reglas*
🍉 ➺ *${prefix}setreglas*

🛡️ 𝗟𝗜𝗦𝗧𝗔 𝗩𝗘𝗥𝗦𝗨𝗦 
🍉 ➺ *${prefix}vs8*
🍉 ➺ *${prefix}vs10*
🍉 ➺ *${prefix}vs15*
🍉 ➺ *${prefix}vs30*

─────────────
> MENÚ PARA HACER 🆚`;

    // Enviar menú con imagen
    await conn.sendMessage(chatId, {
      image: { url: imgUrl },
      caption: texto
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Error en .menufree:", err);
    await conn.sendMessage(chatId, {
      text: "❌ No se pudo mostrar el menú."
    }, { quoted: msg });
  }
};

handler.command = ['menufree'];
module.exports = handler;
