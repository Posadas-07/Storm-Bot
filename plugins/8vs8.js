let partidasVS8 = {}
let jugadoresGlobal = new Set()

let handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const senderNum = sender.replace(/[^0-9]/g, "")
  const isOwner = global.owner.some(([id]) => id === senderNum)
  const isFromMe = msg.key.fromMe

  if (!chatId.endsWith("@g.us")) {
    return conn.sendMessage(chatId, { text: "❌ Este comando solo puede usarse en grupos." }, { quoted: msg })
  }

  const meta = await conn.groupMetadata(chatId)
  const isAdmin = meta.participants.find(p => p.id === sender)?.admin

  if (!isAdmin && !isOwner && !isFromMe) {
    return conn.sendMessage(chatId, { text: "❌ Solo *admins* o *el dueño del bot* pueden usar este comando." }, { quoted: msg })
  }

  const horaTexto = args[0]
  const modalidad = args.slice(1).join(' ') || 'Clásico'
  if (!horaTexto) {
    return conn.sendMessage(chatId, { text: "✳️ Usa el comando así:\n*.vs8 [hora] [modalidad]*\nEjemplo: *.vs8 5:00pm Clásico*" }, { quoted: msg })
  }

  const to24Hour = (str) => {
    let [time, modifier] = str.toLowerCase().split(/(am|pm)/)
    let [h, m] = time.split(":").map(n => parseInt(n))
    if (modifier === 'pm' && h !== 12) h += 12
    if (modifier === 'am' && h === 12) h = 0
    return { h, m: m || 0 }
  }

  const to12Hour = (h, m) => {
    const suffix = h >= 12 ? 'pm' : 'am'
    h = h % 12 || 12
    return `${h}:${m.toString().padStart(2, '0')}${suffix}`
  }

  const base = to24Hour(horaTexto)

  const zonas = [
    { nombre: "MÉXICO", bandera: "🇲🇽", offset: 0 },
    { nombre: "COLOMBIA", bandera: "🇨🇴", offset: 1 },
    { nombre: "VENEZUELA", bandera: "🇻🇪", offset: 2 }
  ]

  const horaMsg = zonas.map(z => {
    let newH = base.h + z.offset
    let newM = base.m
    if (newH >= 24) newH -= 24
    let hora = to12Hour(newH, newM)
    return `${z.bandera} ${z.nombre} : ${hora}`
  }).join("\n")

  const idPartida = new Date().getTime().toString()

  let plantilla = `
*4 𝐕𝐒 4 - ESCUADRA ÚNICA*

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
${horaMsg}

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: 🔫 ${modalidad}
➥ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 𝗧𝗜𝗧𝗨𝗟𝗔𝗥 (APÚNTATE):
👑 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇
🥷🏻 ┇

➥ 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦 (APÚNTATE):
🥷🏻 ┇
🥷🏻 ┇

Reacciona ❤️=Titular | 👍=Suplente
`.trim()

  let tempMsg = await conn.sendMessage(chatId, { text: plantilla }, { quoted: msg })

  partidasVS8[tempMsg.key.id] = {
    chat: chatId,
    jugadores: [],
    suplentes: [],
    originalMsgKey: tempMsg.key,
    modalidad,
    horaMsg,
    idPartida
  }

  conn.ev.on('messages.upsert', async ({ messages }) => {
    let m = messages[0]
    if (!m?.message?.reactionMessage) return

    let reaction = m.message.reactionMessage
    let key = reaction.key
    let emoji = reaction.text
    let sender = m.key.participant || m.key.remoteJid

    let data = partidasVS8[key.id]
    if (!data) return

    const emojisParticipar = ['❤️', '❤', '♥', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❤️‍🔥']
    const emojisSuplente = ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']

    const esTitular = data.jugadores.includes(sender)
    const esSuplente = data.suplentes.includes(sender)

    if (emojisSuplente.includes(emoji)) {
      if (esTitular) {
        if (data.suplentes.length < 2) {
          data.jugadores = data.jugadores.filter(j => j !== sender)
          jugadoresGlobal.delete(sender)
          data.suplentes.push(sender)
        } else return
      } else if (!esSuplente) {
        if (data.suplentes.length < 2) {
          data.suplentes.push(sender)
        } else return
      } else return
    } else if (emojisParticipar.includes(emoji)) {
      if (esTitular) return
      if (esSuplente) {
        if (data.jugadores.length < 8) {
          data.suplentes = data.suplentes.filter(s => s !== sender)
          data.jugadores.push(sender)
          jugadoresGlobal.add(sender)
        } else return
      } else if (data.jugadores.length < 8) {
        data.jugadores.push(sender)
        jugadoresGlobal.add(sender)
      } else return
    } else return

    let jugadores = data.jugadores.map(u => `@${u.split('@')[0]}`)
    let suplentes = data.suplentes.map(u => `@${u.split('@')[0]}`)

    let plantilla = `
*4 𝐕𝐒 4 - ESCUADRA ÚNICA*

⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎
${data.horaMsg}

➥ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: 🔫 ${data.modalidad}
➥ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔 𝗧𝗜𝗧𝗨𝗟𝗔𝗥 (APÚNTATE):
👑 ┇ ${jugadores[0] || ''}
🥷🏻 ┇ ${jugadores[1] || ''}
🥷🏻 ┇ ${jugadores[2] || ''}
🥷🏻 ┇ ${jugadores[3] || ''}
🥷🏻 ┇ ${jugadores[4] || ''}
🥷🏻 ┇ ${jugadores[5] || ''}
🥷🏻 ┇ ${jugadores[6] || ''}
🥷🏻 ┇ ${jugadores[7] || ''}

➥ 𝗦𝗨𝗣𝗟𝗘𝗡𝗧𝗘𝗦 (APÚNTATE):
🥷🏻 ┇ ${suplentes[0] || ''}
🥷🏻 ┇ ${suplentes[1] || ''}

Reacciona ❤️=Titular | 👍=Suplente
`.trim()

    await conn.sendMessage(data.chat, { delete: data.originalMsgKey })
    let newMsg = await conn.sendMessage(data.chat, { text: plantilla, mentions: [...data.jugadores, ...data.suplentes] })

    partidasVS8[newMsg.key.id] = data
    partidasVS8[newMsg.key.id].originalMsgKey = newMsg.key
    delete partidasVS8[key.id]
  })
}

handler.command = ['vs8']
module.exports = handler