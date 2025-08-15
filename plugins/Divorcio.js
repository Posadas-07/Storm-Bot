const fs = require("fs")
const path = "./matrimonios.json"

let handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const senderId = senderNum + "@s.whatsapp.net"

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, { text: "❌ Este comando solo funciona en grupos." }, { quoted: msg })
  }

  let matrimonios = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {}

  if (!matrimonios[senderId]) {
    return conn.sendMessage(chatId, {
      text: `❌ No estás casado con nadie.\nUsa *.casar @usuario* para casarte.`
    }, { quoted: msg })
  }

  const pareja = matrimonios[senderId]
  delete matrimonios[senderId]
  delete matrimonios[pareja]
  fs.writeFileSync(path, JSON.stringify(matrimonios, null, 2))

  const nombre1 = `@${senderNum}`
  const nombre2 = `@${pareja.split("@")[0]}`

  await conn.sendMessage(chatId, {
    text: `💔 *DIVORCIO CONFIRMADO* 💔\n${nombre1} y ${nombre2} han terminado su matrimonio.\nLa relación ha sido disuelta para siempre.`,
    mentions: [senderId, pareja]
  }, { quoted: msg })
}

handler.command = ['divorcio']
handler.tags = ['diversion']
handler.help = ['divorcio']
module.exports = handler