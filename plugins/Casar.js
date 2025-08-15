const fs = require("fs")
let propuestasMatrimonio = {}

let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, { text: "❌ Este comando solo puede usarse en grupos." }, { quoted: msg })
  }

  // Obtener usuario mencionado correctamente
  let userMentioned = (msg.mentionedJid && msg.mentionedJid[0]) ||
                      (args[0] ? args[0].replace(/[@+]/g, '') + "@s.whatsapp.net" : null)

  if (!userMentioned) {
    return conn.sendMessage(chatId, {
      text: "💍 Usa el comando así:\n*.casar @usuario*",
    }, { quoted: msg })
  }

  if (userMentioned === sender) {
    return conn.sendMessage(chatId, {
      text: "❌ No puedes casarte contigo mismo 🥲"
    }, { quoted: msg })
  }

  const nombre1 = `@${senderNum}`
  const nombre2 = `@${userMentioned.split("@")[0]}`

  const mensajePropuesta = `
💍 *PROPUESTA DE MATRIMONIO* 💍

${nombre1} le está pidiendo matrimonio a ${nombre2} ❤️

Responde con una reacción:
❤️ = *Aceptar*
👎 = *Rechazar*
`.trim()

  let propuestaMsg = await conn.sendMessage(chatId, {
    text: mensajePropuesta,
    mentions: [sender, userMentioned]
  }, { quoted: msg })

  propuestasMatrimonio[propuestaMsg.key.id] = {
    chat: chatId,
    de: sender,
    para: userMentioned,
    mensajeKey: propuestaMsg.key
  }

  conn.ev.on("messages.upsert", async ({ messages }) => {
    let m = messages[0]
    if (!m?.message?.reactionMessage) return

    let reaction = m.message.reactionMessage
    let reactedMsgKey = reaction.key
    let emoji = reaction.text
    let quienReacciono = m.key.participant || m.key.remoteJid

    let propuesta = propuestasMatrimonio[reactedMsgKey.id]
    if (!propuesta) return

    // Solo el destinatario puede reaccionar
    if (quienReacciono !== propuesta.para) return

    const nombre1 = `@${propuesta.de.replace(/[^0-9]/g, "")}`
    const nombre2 = `@${propuesta.para.replace(/[^0-9]/g, "")}`

    if (emoji === "❤️") {
      const ruta = "./matrimonios.json"
      let matrimonios = fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta)) : {}

      matrimonios[propuesta.de] = propuesta.para
      matrimonios[propuesta.para] = propuesta.de

      fs.writeFileSync(ruta, JSON.stringify(matrimonios, null, 2))

      await conn.sendMessage(propuesta.chat, {
        text: `🎉 *FELICIDADES* 🎉\n${nombre1} y ${nombre2} ahora están casados 💍❤️\n¡Vivan los novios!`,
        mentions: [propuesta.de, propuesta.para]
      })
    } else if (emoji === "👎") {
      await conn.sendMessage(propuesta.chat, {
        text: `💔 ${nombre1}, lo sentimos pero ${nombre2} ha *rechazado* la propuesta de matrimonio.`,
        mentions: [propuesta.de, propuesta.para]
      })
    }

    delete propuestasMatrimonio[reactedMsgKey.id]
  })
}

handler.command = ['casar']
handler.tags = ['diversion']
handler.help = ['casar @usuario']
module.exports = handler