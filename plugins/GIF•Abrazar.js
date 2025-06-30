const handler = async (msg, { conn }) => {
  try {
    const mentionedJid = msg.mentionedJid && msg.mentionedJid[0]
    const quotedJid = msg.quoted && msg.quoted.sender
    const target = mentionedJid || quotedJid

    const senderId = msg.sender || '0@s.whatsapp.net'
    const sender = '@' + (senderId.split('@')[0] || 'desconocido')
    const receiver = target ? '@' + target.split('@')[0] : '¡alguien!'

    const texto = `🤗 ${sender} le dio un gran abrazo a ${receiver}`

    const gifs = [
      'https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif',
      'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
      'https://media.giphy.com/media/xT39CXg70nNS0MFNLy/giphy.gif',
      'https://media.giphy.com/media/BXrwTdoho6hkQ/giphy.gif'
    ]
    const gif = gifs[Math.floor(Math.random() * gifs.length)]

    await conn.sendMessage(msg.chat, {
      video: { url: gif },
      gifPlayback: true,
      caption: texto,
      mentions: [msg.sender, ...(target ? [target] : [])]
    })
  } catch (e) {
    console.error('Error en el comando abrazar:', e)
    await conn.sendMessage(msg.chat, { text: '⚠️ Ocurrió un error al intentar abrazar. Intenta de nuevo.' })
  }
}

handler.command = ['abrazar']
handler.tags = ['expresion']
handler.help = ['abrazar @usuario']
handler.register = true

module.exports = handler